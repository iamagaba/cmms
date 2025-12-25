/**
 * Documentation Registry
 * 
 * Central registry for all component documentation in the professional
 * design system. Provides searchable, categorized access to component
 * documentation with live examples and interactive features.
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ProfessionalCard,
  ProfessionalInput,
  ProfessionalButton,
  ProfessionalBadge,
  ProfessionalMetricCard,
  ThemeControls
} from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import ComponentDocumentation, { type ComponentDocumentationProps } from './ComponentDocumentation';

// ============================================
// COMPONENT DOCUMENTATION DATA
// ============================================

const componentDocumentation: ComponentDocumentationProps[] = [
  {
    name: 'ProfessionalButton',
    description: 'A comprehensive button component with industrial styling, multiple variants, loading states, and accessibility features.',
    category: 'Actions',
    props: [
      {
        name: 'variant',
        type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'",
        defaultValue: "'primary'",
        description: 'Visual style variant of the button',
        options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']
      },
      {
        name: 'size',
        type: "'sm' | 'base' | 'lg'",
        defaultValue: "'base'",
        description: 'Size of the button affecting padding and font size',
        options: ['sm', 'base', 'lg']
      },
      {
        name: 'icon',
        type: 'string',
        description: 'Icon to display before the button text (Iconify icon name)'
      },
      {
        name: 'loading'