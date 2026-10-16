import type { MDXComponents } from 'mdx/types';

import {
  BadgeList,
  Callout,
  CaseHero,
  CaseImage,
  Column,
  Columns,
  Decision,
  ImageRow,
  Table,
  TextSection,
} from '@/components/case';

// Секции кейсов доступны в MDX без импортов: content/cases/<slug>/<locale>.mdx.
const components: MDXComponents = {
  BadgeList,
  Callout,
  CaseHero,
  CaseImage,
  Column,
  Columns,
  Decision,
  ImageRow,
  Table,
  TextSection,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
