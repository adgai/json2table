type ThemePalette = {
  headerBg: string;
  headerText: string;
  headerBorder: string;
  cellBorder: string;
  accent: string;
  rowHover: string;
  selectedBg: string;
};

type ThemeOption = {
  value: string;      // 唯一标识
  label: string;      // 下拉展示文案
  className: string;  // 对应的 body class
  palette: ThemePalette; // 实际配色
};

export const themeOptions: ThemeOption[] = [
  {
    value: 'neutral',
    label: '默认（亮灰+蓝）',
    className: 'theme-neutral',
    palette: {
      headerBg: '#f5f7fa',
      headerText: '#1f2d3d',
      headerBorder: '#cbd2d9',
      cellBorder: '#666666',
      accent: '#2563eb',
      rowHover: '#e8f3ff',
      selectedBg: 'rgba(255, 0, 0, 0.27)',
    },
  },
  {
    value: 'cool',
    label: '冷灰+青绿',
    className: 'theme-cool',
    palette: {
      headerBg: '#eef2f5',
      headerText: '#102a43',
      headerBorder: '#cbd2d9',
      cellBorder: '#8ba6b6',
      accent: '#00a896',
      rowHover: '#d0f0eb',
      selectedBg: 'rgba(0, 168, 150, 0.12)',
    },
  },
  {
    value: 'warm',
    label: '浅米+橙',
    className: 'theme-warm',
    palette: {
      headerBg: '#fff8ed',
      headerText: '#3a2e2a',
      headerBorder: '#e6d5bf',
      cellBorder: '#d0bfa6',
      accent: '#f08a24',
      rowHover: '#ffe9d2',
      selectedBg: 'rgba(240, 138, 36, 0.18)',
    },
  },
  {
    value: 'contrast',
    label: '深色对比',
    className: 'theme-contrast',
    palette: {
      headerBg: '#111827',
      headerText: '#f9fafb',
      headerBorder: '#1f2937',
      cellBorder: '#374151',
      accent: '#22d3ee',
      rowHover: '#0f172a',
      selectedBg: 'rgba(34, 211, 238, 0.16)',
    },
  },
  {
    value: 'everforest',
    label: 'Everforest（柔和暗色）',
    className: 'theme-everforest',
    palette: {
      headerBg: '#2d353b',
      headerText: '#d3c6aa',
      headerBorder: '#475258',
      cellBorder: '#5c6a72',
      accent: '#a7c080',
      rowHover: '#343f44',
      selectedBg: 'rgba(167, 192, 128, 0.18)',
    },
  },
  {
    value: 'nord',
    label: 'Nord（蓝灰）',
    className: 'theme-nord',
    palette: {
      headerBg: '#2e3440',
      headerText: '#d8dee9',
      headerBorder: '#3b4252',
      cellBorder: '#4c566a',
      accent: '#88c0d0',
      rowHover: '#3b4252',
      selectedBg: 'rgba(136, 192, 208, 0.18)',
    },
  },
  {
    value: 'solarized',
    label: 'Solarized Dark',
    className: 'theme-solarized',
    palette: {
      headerBg: '#002b36',
      headerText: '#eee8d5',
      headerBorder: '#073642',
      cellBorder: '#586e75',
      accent: '#b58900',
      rowHover: '#073642',
      selectedBg: 'rgba(181, 137, 0, 0.18)',
    },
  },
  {
    value: 'github-light',
    label: 'GitHub Light',
    className: 'theme-github-light',
    palette: {
      headerBg: '#f6f8fa',
      headerText: '#1f2328',
      headerBorder: '#d0d7de',
      cellBorder: '#d0d7de',
      accent: '#0969da',
      rowHover: '#eaeef2',
      selectedBg: 'rgba(9, 105, 218, 0.16)',
    },
  },
  {
    value: 'github-dark',
    label: 'GitHub Dark',
    className: 'theme-github-dark',
    palette: {
      headerBg: '#0d1117',
      headerText: '#c9d1d9',
      headerBorder: '#21262d',
      cellBorder: '#30363d',
      accent: '#2f81f7',
      rowHover: '#161b22',
      selectedBg: 'rgba(47, 129, 247, 0.18)',
    },
  },
];

export function getThemeClass(value: string): string {
  return getThemeConfig(value).className;
}

export function getThemeConfig(value: string): ThemeOption {
  return themeOptions.find(t => t.value === value) ?? themeOptions[0];
}

export type { ThemeOption, ThemePalette };
