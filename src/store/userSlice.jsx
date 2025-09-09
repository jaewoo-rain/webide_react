import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialToken = localStorage.getItem('accessToken');

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: initialToken || null,
    user: null, // { username, role }
  },
  reducers: {
    // 항상 { token: '...' } 형태로 payload가 들어오도록 prepare 사용
    setToken: {
      reducer: (state, action) => {
        const token = action.payload.token;
        state.token = token;
        localStorage.setItem('accessToken', token);
        // 앱 전역에서 API 호출 시 토큰 자동 적용 (선택)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
      prepare: (token) => ({ payload: { token } }),
    },

    // 유저 정보 저장
    setUser: (state, action) => {
      state.user = action.payload; // { username, role }
    },

    // 로그아웃
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('accessToken');
      delete axios.defaults.headers.common['Authorization'];
    },
  },
});

export const { setToken, clearAuth, setUser } = userSlice.actions;
export default userSlice;