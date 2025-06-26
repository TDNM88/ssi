"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import Layout from "../components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z
  .object({
    username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof formSchema>

export default function Register() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      // Mock registration - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Thành công",
        description: "Đăng ký tài khoản thành công! Vui lòng đăng nhập.",
      })

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đăng ký thất bại. Vui lòng thử lại!",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout title="Đăng ký tài khoản - London SSI">
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Tạo tài khoản mới</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Đã có tài khoản?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Tên đăng nhập *
                </Label>
                <Input
                  id="username"
                  placeholder="Tên đăng nhập"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Mật khẩu *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Xác nhận mật khẩu *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">
                  Họ và tên *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Họ và tên"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Số điện thoại *
                </Label>
                <Input
                  id="phone"
                  placeholder="Số điện thoại"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 h-10 mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
