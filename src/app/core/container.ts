import "reflect-metadata"
import {AppDataSource} from "@lib/datasource"
import {registerUserModule} from "@module/user/user.container"
import {registerAuthModule} from "@module/auth/auth.container"
import {registerHealthModule} from "@module/health/health.container"

export async function setupContainer() {
  await AppDataSource.initialize()
  await registerUserModule()
  await registerAuthModule()
  await registerHealthModule()
}
