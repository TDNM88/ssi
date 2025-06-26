"use client"

import { useRouter } from "next/router"
import { useMockUser } from "@/lib/mock-user"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { User, LogOut, Wallet } from "lucide-react"

export default function Header() {
  const router = useRouter()
  const user = useMockUser()

  const handleLogout = () => {
    // In a mock environment, just redirect to home
    router.push("/")
  }

  return (
    <header className="h-[90px] bg-[#f5f7ff] relative">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Button
          variant="link"
          onClick={() => router.push("/")}
          className="text-[18px] font-bold text-[#117dbb] p-0 h-auto"
        >
          London SSI
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-gray-600">
            Số dư: <strong className="text-green-600">{user.balance?.toLocaleString() || 0} VND</strong>
          </div>
          
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Tài khoản</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/trade")}>
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Giao dịch</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
