'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutDashboard, ListChecks, Wrench, User } from 'lucide-react'

interface MobileSideMenuProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ListChecks, label: 'Work Orders', href: '/work-orders' },
  { icon: Wrench, label: 'Assets', href: '/assets' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function MobileSideMenu({ isOpen, onClose }: MobileSideMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 z-50"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Menu</h2>
                <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav>
                <ul>
                  {menuItems.map((item) => (
                    <li key={item.label}>
                      <a 
                        href={item.href} 
                        className="flex items-center p-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
