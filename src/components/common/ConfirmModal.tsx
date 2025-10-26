import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { AlertTriangle, UserCheck, UserX, CheckCircle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  icon?: React.ReactNode
  loading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'info',
  icon,
  loading = false
}: ConfirmModalProps) {
  
  const typeConfigs = {
    danger: {
      icon: <UserX className="w-12 h-12 text-red-500" />,
      iconBg: 'bg-red-100',
      buttonVariant: 'primary' as const
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
      iconBg: 'bg-yellow-100',
      buttonVariant: 'primary' as const
    },
    info: {
      icon: <UserCheck className="w-12 h-12 text-blue-500" />,
      iconBg: 'bg-blue-100',
      buttonVariant: 'primary' as const
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      iconBg: 'bg-green-100',
      buttonVariant: 'primary' as const
    }
  }

  const config = typeConfigs[type]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '처리 중...' : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className={`${config.iconBg} rounded-full p-4 mb-4`}>
          {icon || config.icon}
        </div>
        <p className="text-gray-700 text-base leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  )
}

