import type { AppConfig } from "../config/app-config"
import { enrichAllLinks } from "../services/links-service"

export const enrichLinksApi = async (config: AppConfig) => {
  await enrichAllLinks(config)
}
