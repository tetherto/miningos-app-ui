/**
 * MiningOS Android App Theme
 * Dark theme matching the web application
 */

import { COLOR, TABLE_COLORS } from './colors';

export interface Theme {
  // Main colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundQuaternary: string;
  backgroundQuinary: string;
  backgroundSenary: string;
  backgroundSeptenary: string;
  menuBackgroundColor: string;
  menuItemHoverBackgroundColor: string;
  menuItemSelectedBackgroundColor: string;

  // Buttons
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonPrimaryText: string;
  buttonDangerHover: string;

  // Text
  textPrimary: string;
  textPrimaryLight: string;
  textSecondary: string;
  textAccent: string;
  textSuccess: string;
  darkBlack: string;
  obsidian: string;
  ebony: string;
  textGrey1: string;
  textGrey2: string;
  textGrey3: string;
  textGrey4: string;
  textCardBody: string;
  textCardSubtitle: string;

  // Status
  success: string;
  error: string;
  warning: string;
  idle: string;

  // Borders
  strokePrimary: string;
  strokeSecondary: string;
  dividerColor: string;
  tableBorder: string;

  // Tables
  tableBackground: string;
  tableHeaderBackground: string;
  selectedItemGrey: string;

  // Icons
  iconGrey: string;
  iconWrapperGrey: string;
  blue: string;
  onyx: string;

  // Sidebar
  sideBarActiveItem: string;
  sideBarItem: string;

  // RGB colors
  white: string;
  white02: string;
  white05: string;
  white08: string;
}

export const DarkTheme: Theme = {
  // Main colors
  background: COLOR.BLACK,
  backgroundSecondary: COLOR.DARK,
  backgroundTertiary: COLOR.WHITE_ALPHA_005,
  backgroundQuaternary: COLOR.BLACK_ALPHA_05,
  backgroundQuinary: COLOR.WHITE_ALPHA_01,
  backgroundSenary: COLOR.COLD_ORANGE_ALPHA_02,
  backgroundSeptenary: COLOR.OBSIDIAN,
  menuBackgroundColor: COLOR.BLACK,
  menuItemHoverBackgroundColor: COLOR.COLD_ORANGE,
  menuItemSelectedBackgroundColor: COLOR.COLD_ORANGE,

  // Buttons
  buttonPrimary: COLOR.COLD_ORANGE,
  buttonPrimaryHover: COLOR.ORANGE_HOVER,
  buttonPrimaryText: COLOR.WHITE,
  buttonDangerHover: COLOR.ORANGE_BORDER,

  // Text
  textPrimary: COLOR.COLD_ORANGE,
  textPrimaryLight: COLOR.WHITE,
  textSecondary: COLOR.LIGHT,
  textAccent: COLOR.LIGHT,
  textSuccess: COLOR.GRASS_GREEN,
  darkBlack: COLOR.DARK_BLACK,
  obsidian: COLOR.OBSIDIAN,
  ebony: COLOR.EBONY,
  textGrey1: COLOR.DARK_GREY,
  textGrey2: COLOR.GRAY,
  textGrey3: COLOR.WHITE_ALPHA_05,
  textGrey4: COLOR.WHITE_ALPHA_07,
  textCardBody: COLOR.CARD_BODY_TEXT,
  textCardSubtitle: COLOR.CARD_SUBTITLE_TEXT,

  // Status
  success: COLOR.GRASS_GREEN,
  error: COLOR.BRICK_RED,
  warning: COLOR.YELLOW,
  idle: COLOR.DARK_GREY,

  // Borders
  strokePrimary: COLOR.COLD_ORANGE,
  strokeSecondary: COLOR.WHITE_ALPHA_01,
  dividerColor: COLOR.COLD_ORANGE,
  tableBorder: TABLE_COLORS.BORDER,

  // Tables
  tableBackground: TABLE_COLORS.BACKGROUND,
  tableHeaderBackground: TABLE_COLORS.HEADER_BACKGROUND,
  selectedItemGrey: COLOR.SELECTED_ITEM_GREY,

  // Icons
  iconGrey: COLOR.ICON_GREY,
  iconWrapperGrey: COLOR.ICON_WRAPPER_GREY,
  blue: COLOR.BLUE,
  onyx: COLOR.ONYX,

  // Sidebar
  sideBarActiveItem: COLOR.SIDEBAR_ACTIVE_ITEM,
  sideBarItem: COLOR.SIDEBAR_ITEM,

  // RGB colors
  white: COLOR.WHITE,
  white02: COLOR.WHITE_ALPHA_02,
  white05: COLOR.WHITE_ALPHA_05,
  white08: COLOR.WHITE_ALPHA_08,
} as const;

export { COLOR, TABLE_COLORS, CHART_COLORS } from './colors';
