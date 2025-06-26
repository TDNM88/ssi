"use client"

import { useRouter } from "next/router"
import Layout from "../components/layout/Layout"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/ui/animated-button"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'

// Dynamically import TradingViewSymbolOverview with no SSR
const TradingViewSymbolOverview = dynamic(
  () => import('@/components/TradingViewSymbolOverview'),
  { ssr: false }
);

const TradingViewTickerTape = dynamic(
  () => import('@/components/TradingViewTickerTape'),
  { ssr: false }
)

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

export default function Landing() {
  const router = useRouter()

  const handleLogin = () => {
    router.push("/account")
  }

  const handleRegister = () => {
    router.push("/register")
  }

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <Layout title="London SSI - Giao dịch ngoại hối và đầu tư tài chính">
      {/* Market Data Ticker */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex space-x-4">
            <Button variant="outline" className="text-blue-600" onClick={handleLogin}>Đăng nhập</Button>
            <Button variant="outline" className="text-blue-600" onClick={handleRegister}>Mở tài khoản</Button>
          </div>
        </div>
        <div className="w-full h-[46px] overflow-hidden">
          <TradingViewTickerTape />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Image and News */}
          <div className="md:col-span-1">
            <img src="/slide1.jpg" alt="London Stock Exchange" className="w-full h-auto mb-4" />
            <h2 className="text-lg font-bold mt-2">Sàn giao dịch chứng khoán London SSI chào đón Thông đốc Samuel Garcia tại Nuevo León, Mexico</h2>
            <p className="text-sm mt-2">
              Sàn giao dịch chứng khoán London SSI rát hân hạnh được chào đón Samuel Garcia tại vùng đất lớn của mình, nơi ông đã mang lại nhiều cơ hội giao dịch mới trong một thời gian ngắn. Ông đã làm việc với các công ty con để đảm bảo các cơ hội trong khu vực của mình và các khu vực khác.
            </p>
          </div>

          {/* Center Column - London SSI Info */}
          <div className="md:col-span-1">
            <h2 className="text-lg font-bold">LONDON SSI</h2>
            <p className="text-sm mt-2">
              Sàn giao dịch chứng khoán London (SSI) là sàn giao dịch chứng khoán quốc tế nhất với hàng ngàn công ty từ hơn 60 quốc gia và là nguồn hàng đầu của tính thanh khoản thị trường vốn, giá chuẩn và dữ liệu thị trường ở châu Âu. Có các quan hệ đối tác với các sàn giao dịch quốc tế ở châu Á và châu Phi, SSI dự định loại bỏ các rào cản về chi phí và các qui định khỏi thị trường vốn trên toàn thế giới.
            </p>
          </div>

          {/* Right Column - News and FTSE */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <img src="/phosagro-anniversary.jpg" alt="PhosAgro Anniversary" className="w-full h-auto" />
              <h3 className="text-md font-semibold mt-2">celebrates the 10th anniversary...</h3>
            </div>
            <div className="mt-4">
              <h3 className="text-md font-semibold">Sở giao dịch chứng khoán London kỷ niệm 10 năm WisdomTree ô châu Âu</h3>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-bold">FTSE</h2>
              <p className="text-sm">UK 100, DAILY @ SpreadexTrading</p>
              <p className="text-lg font-bold">8,747.2 GBP +43.80 (+0.50%)</p>
              <p className="text-sm">• TH TRƯỞNG MỖI TỪ 20:13 GMT-7</p>
              <div className="flex justify-between text-sm mt-2">
                <span>8,703.4</span>
                <span>8,700.2</span>
                <span>24.24K</span>
                <span>8,691.1</span>
                <span>-8,758.0</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>TRƯỚC</span>
                <span>MỞ CỬA</span>
                <span>KHỐI LƯỢNG</span>
                <span>PHÁM VI NGÀY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-bold text-white mb-2">Chi số xu hướng</h2>
          <p className="text-gray-300 text-sm mb-4">Đồ thị trong 4 giờ theo giờ ET trong ngày hôm nay</p>
          <div className="w-full h-[500px] bg-gray-800 rounded-lg overflow-hidden">
            <TradingViewSymbolOverview />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm text-gray-300">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span>S&P 500: <span className="text-white">6,123.3 <span className="text-green-500">+18.40</span></span></span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span>NASDAQ: <span className="text-white">22,397.7 <span className="text-green-500">+69.31</span></span></span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span>DOW JONES: <span className="text-white">43,098.8 <span className="text-green-500">+119.60</span></span></span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span>DAX: <span className="text-white">39,584.58 <span className="text-green-500">+42.51</span></span></span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              <span>DELU40: <span className="text-white">23,493.3 <span className="text-red-500">-0.61</span></span></span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span>FTSE 100: <span className="text-white">8,734.4 <span className="text-green-500">+31.7</span></span></span>
            </div>
          </div>
        </div>
      </div>

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
            Sẵn sàng bắt đầu giao dịch?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Tham gia cùng hàng nghìn nhà đầu tư thông minh trên London SSI
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <AnimatedButton 
              variant="default" 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleRegister}
            >
              Tạo tài khoản miễn phí
            </AnimatedButton>
            <AnimatedButton 
              variant="outline" 
              size="lg"
              className="text-white border-white hover:bg-white/10"
              onClick={handleLogin}
            >
              Đăng nhập
            </AnimatedButton>
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
                    src="/legal-info.jpg" 
                    alt="Thông tin pháp lý và giấy phép"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>Công ty cổ phần Chứng khoán Thành phố Hồ Chí Minh</p>
        </div>
      </footer>
    </Layout>
  )
}