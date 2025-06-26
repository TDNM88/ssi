"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"

// Components
import Layout from "@/components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
})

type FormValues = z.infer<typeof formSchema>

export default function Login() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    console.log('Login form submitted with values:', values);
    setIsLoading(true);
    
    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/trade";
      console.log('Initiating signIn with callbackUrl:', callbackUrl);
      
      // Create a promise that will reject after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out. Please try again.'));
        }, 10000); // 10 second timeout
      });
      
      // Create the signIn promise
      const signInPromise = signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });
      
      // Race the signIn against the timeout
      const result = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      console.log('signIn result:', result);
      
      if (result?.error) {
        console.error('Authentication error:', result.error);
        throw new Error(result.error);
      }

      if (result?.url) {
        console.log('Authentication successful, redirecting to:', callbackUrl);
        router.push(callbackUrl);
        router.refresh();
      } else {
        console.warn('No URL returned from signIn, but no error occurred');
        throw new Error('No redirect URL received from authentication');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Đã xảy ra lỗi khi đăng nhập";
      const errorMessageLower = error.message?.toLowerCase() || '';
      
      if (errorMessageLower.includes('email') || errorMessageLower.includes('mật khẩu')) {
        errorMessage = error.message;
      } else if (errorMessageLower.includes('request') || errorMessageLower.includes('fetch')) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
      } else if (errorMessageLower.includes('timeout')) {
        errorMessage = "Yêu cầu đăng nhập đã hết thời gian chờ. Vui lòng thử lại.";
      } else if (errorMessageLower.includes('network')) {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.";
      } else if (errorMessageLower.includes('too many requests')) {
        errorMessage = "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ít phút.";
      } else if (errorMessageLower.includes('locked')) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Lỗi đăng nhập",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout title="Đăng nhập - London SSI">
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Đăng nhập vào tài khoản</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Hoặc{" "}
              <button
                onClick={() => router.push("/register")}
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                đăng ký tài khoản mới
              </button>
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Địa chỉ email"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("email")}
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">
                    Mật khẩu
                  </Label>
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-sm text-blue-400 hover:text-blue-300"
                    disabled={isLoading}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu"
                  className="bg-gray-700 border-gray-600 text-white"
                  {...form.register("password")}
                  disabled={isLoading}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 h-10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

