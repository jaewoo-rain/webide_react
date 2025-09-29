import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closePage, setCurrentPage } from '../../store/openPageSlice';
import { addFile } from '../../store/projectSlice';

export default function FileTabs() {
    // ✅ 1. 필요한 상태를 명확하게 useSelector로 가져옵니다.
    const { tree, fileMap, isLoaded } = useSelector((state) => state.project);
    const { open: openFileIds, current: currentPageId } = useSelector((state) => state.openPage);

    const dispatch = useDispatch();

    // ✅ 2. isLoaded 플래그를 사용해 데이터가 로드되기 전에는 아무것도 렌더링하지 않습니다.
    if (!isLoaded) {
        return <div className="bg-[#2D2D2D] flex text-sm h-[40px]"></div>; // 또는 로딩 스켈레톤 UI
    }

    return (
        <div className="bg-[#2D2D2D] flex text-sm">
            {openFileIds.map((fileId) => {
                // ✅ 3. fileMap에 해당 fileId의 정보가 있는지 확인합니다. (방어적 렌더링)
                const fileData = fileMap[fileId];
                if (!fileData) {
                    // fileMap에 정보가 없으면 해당 탭은 렌더링하지 않고 건너뜁니다.
                    return null;
                }

                return (
                    <div
                        key={fileId} // key는 반복되지 않는 고유한 값인 fileId를 사용하는 것이 좋습니다.
                        onClick={() => {
                            dispatch(setCurrentPage(fileId));
                        }}
                        className={`file-tab px-3 py-2 flex items-center hover:bg-[#37373D] cursor-pointer ${fileId === currentPageId ? 'active' : ''}`}
                    >
                        <div className="w-4 h-4 flex items-center justify-center mr-1">
                            <i className="ri-file-code-line text-[#519ABA]"></i>
                        </div>
                        {/* 이제 fileData가 항상 존재하므로 에러가 발생하지 않습니다. */}
                        <span>{fileData.name}</span>
                        <button
                            className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
                            onClick={(event) => {
                                event.stopPropagation();
                                dispatch(closePage(fileId));
                            }}
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>
                );
            })}
            {/* 페이지 추가 버튼은 그대로 유지 */}
            <button className="px-3 py-2 flex items-center"
                    onClick={() => {
                        dispatch(addFile({ fileName: "untitled.py", parentId: "root" }));
                    }}>
                <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-add-line"></i>
                </div>
            </button>
        </div>
    );
}