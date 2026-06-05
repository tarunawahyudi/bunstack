import {container} from "tsyringe"
import {AuthControllerImpl} from "@module/auth/controller/auth.controller.impl"
import type {AuthService} from "@module/auth/service/auth.service"
import {AuthServiceImpl} from "@module/auth/service/auth.service.impl"

export async function registerAuthModule() {
  container.register<AuthService>("AuthService", {useClass: AuthServiceImpl})
  container.register("AuthController", {useClass: AuthControllerImpl})
}
