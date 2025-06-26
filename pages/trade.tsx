"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useMockUser, type User } from "@/lib/mock-user";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowUp, ArrowDown, Clock, BarChart2, DollarSign, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import Layout from "../components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getMarketData, type MarketData } from "../lib/api";
import dynamic from "next/dynamic";

const TradingViewWidget = dynamic(
  () => import("@/components/TradingViewWidget"),
  { ssr: false }
);

// Constants
const QUICK_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];
const TIME_FRAMES = [
  { value: "1", label: "1 phút" },
  { value: "5", label: "5 phút" },
  { value: "15", label: "15 phút" },
];

const Trade = () => {
  const { toast } = useToast();
  const user = useMockUser();
  const router = useRouter();
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Trade State
  const [amount, setAmount] = useState<string>("");
  const [timeFrame, setTimeFrame] = useState("1");
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAction, setSelectedAction] = useState<"UP" | "DOWN" | null>(null);
  
  // Market Data
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Trade State
  const [activeTrade, setActiveTrade] = useState<{
    direction: "UP" | "DOWN";
    entryPrice: number;
    amount: number;
    endTime: number;
  } | null>(null);
  
  // Trade Result
  const [tradeResult, setTradeResult] = useState<{
    status: "idle" | "win" | "lose" | "processing";
    direction?: "UP" | "DOWN";
    entryPrice?: number;
    exitPrice?: number;
    amount?: number;
    profit?: number;
  }>({ status: "idle" });

  // Fetch market data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMarketData();
        setMarketData(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching market data:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu thị trường",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [toast]);

  // Handle trade timer
  useEffect(() => {
    if (!activeTrade) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const timeRemaining = Math.ceil((activeTrade.endTime - now) / 1000);

      if (timeRemaining <= 0) {
        // Trade settlement
        const currentPrice = marketData[0]?.price || 0;
        const isWin = activeTrade.direction === "UP" 
          ? currentPrice > activeTrade.entryPrice 
          : currentPrice < activeTrade.entryPrice;
        const profit = isWin ? activeTrade.amount * 0.8 : -activeTrade.amount;

        setTradeResult({
          status: isWin ? "win" : "lose",
          direction: activeTrade.direction,
          entryPrice: activeTrade.entryPrice,
          exitPrice: currentPrice,
          amount: activeTrade.amount,
          profit,
        });

        setActiveTrade(null);
        clearInterval(timer);

        // Auto-hide result after 5 seconds
        setTimeout(() => {
          setTradeResult(prev => ({ ...prev, status: "idle" }));
        }, 5000);
      } else {
        setTimeLeft(timeRemaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTrade, marketData]);

  // Handle authentication
  useEffect(() => {
    if (user === null) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/trade')}`);
    }
  }, [user, router]);

  const handleAction = (direction: "UP" | "DOWN") => {
    const betAmount = Number(amount);
    if (!betAmount || isNaN(betAmount)) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
      });
      return;
    }

    if (betAmount < 100000) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Số tiền tối thiểu là 100,000 VND",
      });
      return;
    }

    if (user && betAmount > (user.balance || 0)) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Số dư không đủ",
      });
      return;
    }

    setSelectedAction(direction);
    setIsConfirming(true);
  };

  const confirmTrade = () => {
    if (!selectedAction) return;

    const entryPrice = marketData[0]?.price || 0;
    const tradeAmount = Number(amount);

    setActiveTrade({
      direction: selectedAction,
      entryPrice,
      amount: tradeAmount,
      endTime: Date.now() + (parseInt(timeFrame) * 60 * 1000),
    });

    setIsConfirming(false);
    setSelectedAction(null);
    setAmount("");

    toast({
      title: "Đặt lệnh thành công",
      description: `Đã đặt lệnh ${selectedAction === "UP" ? "TĂNG" : "GIẢM"} với giá ${entryPrice.toFixed(2)}`,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleAmountClick = (value: number) => {
    setAmount(value.toString());
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Đang tải...</span>
      </div>
    );
  }

  return (
    <Layout title="Giao dịch - London SSI">
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        {/* Trade Result Modals */}
        <Dialog
          open={tradeResult.status === "win" || tradeResult.status === "lose"}
          onOpenChange={(open) => !open && setTradeResult(prev => ({ ...prev, status: "idle" }))}
        >
          <DialogContent className="sm:max-w-[425px] bg-gray-800 border-green-500">
            <DialogHeader>
              <DialogTitle className={`text-2xl text-center ${
                tradeResult.status === "win" ? "text-green-500" : "text-red-500"
              }`}>
                {tradeResult.status === "win" ? "Chúc mừng bạn đã thắng!" : "Rất tiếc, bạn đã thua"}
              </DialogTitle>
              <DialogDescription className="text-center text-white">
                {tradeResult.profit && tradeResult.profit > 0 ? "+" : ""}
                {tradeResult.profit ? formatCurrency(tradeResult.profit) : 0} VND
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-400">Lệnh:</div>
                <div className="text-white">
                  {tradeResult.direction === "UP" ? "TĂNG" : "GIẢM"}
                </div>

                <div className="text-gray-400">Giá vào:</div>
                <div className="text-white">{tradeResult.entryPrice?.toFixed(2)}</div>

                <div className="text-gray-400">Giá đóng:</div>
                <div className="text-white">{tradeResult.exitPrice?.toFixed(2)}</div>

                <div className="text-gray-400">Số tiền:</div>
                <div className="text-white">
                  {tradeResult.amount ? formatCurrency(tradeResult.amount) : 0} VND
                </div>

                <div className="text-gray-400">Lợi nhuận:</div>
                <div className={`font-bold ${
                  (tradeResult.profit || 0) >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {tradeResult.profit && tradeResult.profit > 0 ? "+" : ""}
                  {tradeResult.profit ? formatCurrency(tradeResult.profit) : 0} VND
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setTradeResult({ status: "idle" })}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Trade Dialog */}
        <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
          <DialogContent className="sm:max-w-[425px] bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Xác nhận đặt lệnh</DialogTitle>
              <DialogDescription className="text-gray-300">
                Bạn có chắc chắn muốn đặt lệnh {selectedAction === "UP" ? "TĂNG" : "GIẢM"} với số tiền {formatCurrency(Number(amount))} VND?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-400">Loại lệnh:</div>
                <div className={`font-bold ${
                  selectedAction === "UP" ? "text-green-500" : "text-red-500"
                }`}>
                  {selectedAction === "UP" ? "TĂNG" : "GIẢM"}
                </div>

                <div className="text-gray-400">Số tiền:</div>
                <div className="text-white">{formatCurrency(Number(amount))} VND</div>

                <div className="text-gray-400">Thời gian:</div>
                <div className="text-white">{timeFrame} phút</div>

                <div className="text-gray-400">Tỷ lệ thắng:</div>
                <div className="text-green-500 font-bold">180%</div>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsConfirming(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className={`flex-1 ${
                  selectedAction === "UP" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={confirmTrade}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800 border-gray-700 h-[500px]">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Biểu đồ giá</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>
                      Cập nhật: {lastUpdated?.toLocaleTimeString() || "Đang tải..."}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        setIsLoading(true);
                        getMarketData().then(data => {
                          setMarketData(data);
                          setLastUpdated(new Date());
                          setIsLoading(false);
                        });
                      }}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[500px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="h-full">
                    <TradingViewWidget symbol="OANDA:XAUUSD" interval="5" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Data */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Thị trường</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-400 text-left text-sm">
                        <th className="pb-2">Cặp tiền</th>
                        <th className="text-right pb-2">Giá</th>
                        <th className="text-right pb-2">Thay đổi</th>
                        <th className="text-right pb-2">24h Cao/Thấp</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {marketData.map((item) => (
                        <tr key={item.symbol} className="border-t border-gray-700">
                          <td className="py-3">{item.symbol}</td>
                          <td className="text-right">{item.price.toFixed(2)}</td>
                          <td className={`text-right ${
                            (item.changePercent || 0) >= 0 ? "text-green-500" : "text-red-500"
                          }`}>
                            {item.changePercent && item.changePercent > 0 ? "↑" : "↓"} {Math.abs(item.changePercent || 0).toFixed(2)}%
                          </td>
                          <td className="text-right text-sm">
                            <div>{item.high?.toFixed(2)}</div>
                            <div className="text-gray-400">{item.low?.toFixed(2)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Trading Panel */}
          <div className="space-y-6">
            {/* Account Balance */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Số dư tài khoản</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(user?.balance ?? 0)} VND
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm" className="text-xs">
                    Nạp tiền
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Rút tiền
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trading Panel */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Đặt lệnh</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Time Frame Selection */}
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Thời gian đáo hạn</div>
                  <Tabs 
                    value={timeFrame} 
                    onValueChange={setTimeFrame}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                      {TIME_FRAMES.map((tf) => (
                        <TabsTrigger 
                          key={tf.value} 
                          value={tf.value}
                          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                          {tf.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="amount" className="text-sm text-gray-400">
                      Số tiền (VND)
                    </label>
                    <span className="text-xs text-gray-400">
                      Tối thiểu: {formatCurrency(100000)}
                    </span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Nhập số tiền"
                  />
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {QUICK_AMOUNTS.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleAmountClick(value)}
                      >
                        {value / 1000}K
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-bold"
                    onClick={() => handleAction("UP")}
                    disabled={isLoading || !amount}
                  >
                    <ArrowUp className="h-5 w-5 mr-2" />
                    TĂNG
                  </Button>
                  <Button
                    type="button"
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-bold"
                    onClick={() => handleAction("DOWN")}
                    disabled={isLoading || !amount}
                  >
                    <ArrowDown className="h-5 w-5 mr-2" />
                    GIẢM
                  </Button>
                </div>

                {/* Active Trade Info */}
                {activeTrade && (
                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Lệnh đang mở</span>
                      <span className="text-sm text-gray-400">
                        Còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Loại lệnh:</div>
                      <div className={`font-bold ${
                        activeTrade.direction === "UP" ? "text-green-500" : "text-red-500"
                      }`}>
                        {activeTrade.direction === "UP" ? "TĂNG" : "GIẢM"}
                      </div>

                      <div className="text-gray-400">Giá vào:</div>
                      <div className="text-white">{activeTrade.entryPrice.toFixed(2)}</div>

                      <div className="text-gray-400">Số tiền:</div>
                      <div className="text-white">{formatCurrency(activeTrade.amount)} VND</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trading Rules */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Hướng dẫn giao dịch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Chọn hướng giá bạn dự đoán: TĂNG hoặc GIẢM</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Nhập số tiền bạn muốn đặt cược (tối thiểu 100,000 VNĐ)</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Chọn thời gian đáo hạn: 1, 5 hoặc 15 phút</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Nhấn nút <span className="font-bold">TĂNG</span> nếu bạn nghĩ giá sẽ tăng, hoặc <span className="font-bold">GIẢM</span> nếu bạn nghĩ giá sẽ giảm</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Chờ đến khi hết thời gian đáo hạn để biết kết quả</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Nếu dự đoán đúng, bạn sẽ nhận được 180% số tiền cược</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Nếu dự đoán sai, bạn sẽ mất toàn bộ số tiền cược</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Bạn có thể xem kết quả giao dịch trong phần <span className="font-bold">Lịch sử giao dịch</span></p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Giao dịch sẽ tự động đóng khi hết thời gian đáo hạn</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">•</div>
                  <p>Không thể hủy lệnh sau khi đã đặt thành công</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-red-500">⚠️</div>
                  <p className="text-yellow-400">Giao dịch tài chính có rủi ro, vui lòng đầu tư có trách nhiệm</p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400">* Tỷ lệ thắng và điều khoản có thể thay đổi tùy theo chính sách của nhà cung cấp</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Market Data Table */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Giá thị trường</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-gray-400 text-left text-sm">
                        <th className="pb-2">Cặp tiền</th>
                        <th className="text-right pb-2">Giá hiện tại</th>
                        <th className="text-right pb-2">Thay đổi</th>
                        <th className="text-right pb-2">24h Cao</th>
                        <th className="text-right pb-2">24h Thấp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {marketData.map((item) => (
                        <tr key={item.symbol} className="text-sm">
                          <td className="py-2">{item.symbol}</td>
                          <td className="text-right">{item.price.toFixed(2)}</td>
                          <td className={`text-right ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                          </td>
                          <td className="text-right text-gray-400">{item.high.toFixed(2)}</td>
                          <td className="text-right text-gray-400">{item.low.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Trade;