import { useState } from "react";

export default function CreateProjectModal({ onClose, onSubmit }) {
    const [projectName, setProjectName] = useState('');
    const [image, setImage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // 기본 이미지는 webide-vnc 권장 (noVNC/VNC 내장)
        onSubmit({ projectName, image: image?.trim() || 'webide-vnc' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-white">새 프로젝트 생성</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="projectName" className="block text-white text-sm font-bold mb-2">
                            프로젝트 이름
                        </label>
                        <input
                            type="text"
                            id="projectName"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-800 rounded-lg focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="image" className="block text-white text-sm font-bold mb-2">
                            사용 이미지(언어)
                        </label>
                        <input
                            type="text"
                            id="image"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-800 rounded-lg focus:outline-none focus:shadow-outline"
                            placeholder="예: webide-vnc (미입력 시 webide-vnc)"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 mr-2 font-bold text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 focus:outline-none focus:shadow-outline"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                        >
                            생성
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}