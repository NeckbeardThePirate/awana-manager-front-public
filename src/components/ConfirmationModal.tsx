import { useEffect } from 'react';

interface ConfirmationModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmationModal({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
}: ConfirmationModalProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onCancel();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onCancel]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onCancel}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-md mx-4 rounded-2xl border border-gray-600/30 bg-gray-800/95 backdrop-blur-xl shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="px-6 py-4 border-b border-gray-600/30">
					<h3 className="text-lg font-semibold text-gray-100">{title}</h3>
				</div>

				{/* Content */}
				<div className="px-6 py-4">
					<p className="text-gray-300 text-sm leading-relaxed">{message}</p>
				</div>

				{/* Actions */}
				<div className="px-6 py-4 border-t border-gray-600/30 flex gap-3 justify-end">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-600/60 border border-gray-500/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 text-sm font-medium text-gray-100 bg-gray-600/80 hover:bg-gray-500/90 border border-gray-400/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
}
