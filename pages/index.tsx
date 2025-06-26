"use client"

import { useRouter } from "next/router"
import { useMockUser } from "@/lib/mock-user"
import Layout from "../components/layout/Layout"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import MarketDataTicker from "@/components/MarketDataTicker"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } },
}

export default function Landing() {
  const router = useRouter()
  const user = useMockUser()

  const handleGetStarted = () => {
    router.push("/trade")
  }

  const handleLogin = () => {
    router.push("/account")
  }

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <Layout title="London SSI - Giao dịch ngoại hối và đầu tư tài chính">
      {/* Market Data Ticker */}
      <MarketDataTicker />
      
      {/* Hero Section */}
      <motion.div
        className="relative flex items-center justify-center py-32 px-4 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/slide1.jpg?height=600&width=1200&query=financial+trading+background)",
          minHeight: "60vh",
        }}
        initial="hidden"
        animate={isVisible ? "show" : "hidden"}
        variants={container}
      >
        <div className="container mx-auto text-center text-white">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            variants={item}
          >
            LONDON SSI
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-200 leading-relaxed"
            variants={item}
          >
            SSI là sàn giao dịch chứng khoán quốc tế nhất với hàng ngàn công ty từ hơn 60 quốc gia và là nguồn hàng đầu của tính thanh khoản thị trường vốn, 
            giá chuẩn và dữ liệu thị trường ở châu Âu. Có các quan hệ đối tác với các sàn giao dịch quốc tế ở châu Á và châu Phi, SSI dự định loại bỏ
            các rào cản về chi phí và các qui định khỏi thị trường vốn trên toàn thế giới.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={item}
          >
            <AnimatedButton 
              variant="default" 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleGetStarted}
            >
              {user ? "Bắt đầu giao dịch" : "Đăng ký ngay"}
            </AnimatedButton>

            <AnimatedButton 
              variant="outline" 
              size="lg"
              className="text-black border-white hover:bg-white/10"
              onClick={handleLogin}
            >
              {user ? "Tài khoản của tôi" : "Đăng nhập"}
            </AnimatedButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Tại sao chọn London SSI?
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Bảo mật cao",
                description: "Công nghệ bảo mật đa tầng, đảm bảo an toàn tài sản của bạn",
                icon: "🔒",
              },
              {
                title: "Giao dịch nhanh",
                description: "Tốc độ giao dịch nhanh chóng, xử lý lên đến hàng triệu lệnh mỗi giây",
                icon: "⚡",
              },
              {
                title: "Hỗ trợ 24/7",
                description: "Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng hỗ trợ mọi lúc mọi nơi",
                icon: "🛟",
              },
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-gray-800 p-6 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-blue-500/20"
                variants={item}
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="text-4xl mb-4 transform hover:scale-110 transition-transform inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Call to Action Section */}
      <motion.div 
        className="py-16 bg-gray-800"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {user ? `Chào mừng trở lại, ${user.username}!` : "Sẵn sàng bắt đầu giao dịch?"}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {user
              ? "Tiếp tục hành trình giao dịch của bạn với London SSI"
              : "Tham gia cùng hàng nghìn nhà đầu tư thông minh trên London SSI"}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            {!user ? (
              <>
                <AnimatedButton 
                  variant="default" 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/register")}
                >
                  Tạo tài khoản miễn phí
                </AnimatedButton>
                <AnimatedButton 
                  variant="outline" 
                  size="lg"
                  className="text-white border-white hover:bg-white/10"
                  onClick={() => router.push("/login")}
                >
                  Đăng nhập
                </AnimatedButton>
              </>
            ) : (
              <>
                <AnimatedButton 
                  variant="default" 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/trade")}
                >
                  Giao dịch ngay
                </AnimatedButton>
                <AnimatedButton 
                  variant="outline" 
                  size="lg"
                  className="text-black border-white hover:bg-white/10"
                  onClick={() => router.push("/account")}
                >
                  Quản lý tài khoản
                </AnimatedButton>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Regulatory Information Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold tracking-tight text-white text-center sm:text-4xl mb-10">
              Thông Tin Pháp Lý
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="order-2 md:order-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 space-y-6 h-full">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Quyết định số 599/2007/QD-TTg
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  Theo Quyết định số 599/2007/QD-TTg của Thủ tướng Chính phủ năm 2007, 
                  Trung tâm Giao dịch Chứng khoán TP.HCM được chuyển đổi thành Sở Giao dịch 
                  Chứng khoán TP.HCM, với vốn điều lệ ban đầu là 1.000 tỷ đồng và Bộ Tài chính 
                  là chủ sở hữu đại diện cho cơ quan. Vốn điều lệ được điều chỉnh lên 2.000 tỷ 
                  đồng vào năm 2018.
                </p>
              </div>

              <div className="h-px bg-white/20"></div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Quyết định số 37/2020/QD-TTg
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  Thủ tướng Chính phủ đã ban hành Quyết định số 37/2020/QD-TTg ngày 23/12/2020 
                  về việc thành lập Sở Giao dịch Chứng khoán Việt Nam. Theo đó, Sở giao dịch 
                  chứng khoán Hà Nội và Sở giao dịch chứng khoán TP.HCM trở thành công ty con do 
                  Sở giao dịch chứng khoán Việt Nam sở hữu 100% vốn điều lệ.
                </p>
              </div>

                  <div className="pt-4">
                    <AnimatedButton
                      onClick={() => router.push("/about")}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10"
                    >
                      Tìm hiểu thêm về chúng tôi
                    </AnimatedButton>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-white/20 h-full">
                  <img 
                    src="/ss.jpg" 
                    alt="Thông tin pháp lý và giấy phép"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
