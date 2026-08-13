import { COLOR } from '@/constants/colors'

export const getRoleBadgeColors = (role: string): { color: string; bgColor: string } => {
  const roleColors: Record<string, { color: string; bgColor: string }> = {
    admin: { color: COLOR.COLD_ORANGE, bgColor: COLOR.COLD_ORANGE_ALPHA_01 },
    site_admin: { color: COLOR.GREEN, bgColor: COLOR.GREEN_ALPHA_01 },
    site_operator: { color: COLOR.ORANGE_WARNING, bgColor: COLOR.ORANGE_WARNING_ALPHA_01 },
    read_only_user: { color: COLOR.GREY_IDLE, bgColor: COLOR.GREY_IDLE_ALPHA_01 },
    developer: { color: COLOR.SLEEP_BLUE, bgColor: COLOR.SLEEP_BLUE_ALPHA_01 },
  }

  return roleColors[role] || { color: COLOR.GREY_IDLE, bgColor: COLOR.GREY_IDLE_ALPHA_01 }
}
