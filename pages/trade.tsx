"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Layout from "../components/layout/Layout";
import { DI, nae } from "../lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowUp, ArrowDown, Clock, BarChart2, DollarSign, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { getMarketData, MarketData } from "../lib/api";

// Dynamically import the trading view component to avoid SSR issues
const TradingViewWidget = dynamic(
  () => import("../components/TradingViewWidget"),
  {
    ssr: false,
    loading: () =>
      <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="animate-pulse text-gray-400">Đang tải biểu đồ...</div>
      </div>,
  }
);

// Using MarketData interface from ../lib/api

const QUICK_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];
const TIME_FRAMES = [
  { value: "1", label: "1 phút" },
  { value: "30", label: "30 phút" },
  { value: "60", label: "1 giờ" },
];

const Trade = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [timeFrame, setTimeFrame] = useState("1");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeResult, setTradeResult] = useState<{
    status: "idle" | "win" | "lose" | "processing";
    direction?: "UP" | "DOWN";
    entryPrice?: number;
    exitPrice?: number;
    amount?: number;
    profit?: number;
  }>({ status: "idle" });
  const [activeTrade, setActiveTrade] = useState<{
    direction: "UP" | "DOWN";
    entryPrice: number;
    amount: number;
    endTime: number;
  } | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Timer effect for trading session
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchMarketData = async () => {
      try {
        const data = await getMarketData();
        setMarketData(data);
        setIsLoading(false);
        setLastUpdated(new Date());
      } catch (error) {
        console.error(error);
      }
    };

    fetchMarketData();

    const intervalId = setInterval(fetchMarketData, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Active trade timer and settlement
  useEffect(() => {
    if (!activeTrade) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const timeRemaining = Math.ceil((activeTrade.endTime - now) / 1000);

      if (timeRemaining <= 0) {
        // Trade settlement time
        const currentPrice = marketData.find((item) => item.symbol === "XAU/USD")?.price || 0;
        const isWin =
          activeTrade.direction === "UP" ? currentPrice > activeTrade.entryPrice : currentPrice < activeTrade.entryPrice;

        const profit = isWin ? activeTrade.amount * 0.8 : -activeTrade.amount; // 80% payout on win

        setTradeResult({
          status: isWin ? "win" : "lose",
          direction: activeTrade.direction,
          entryPrice: activeTrade.entryPrice,
          exitPrice: currentPrice,
          amount: activeTrade.amount,
          profit,
        });

        // Update user balance (in a real app, this would be an API call)
        if (user) {
          user.balance = (user.balance || 0) + profit;
        }

        setActiveTrade(null);
        clearInterval(timer);

        // Auto-hide result after 5 seconds
        setTimeout(() => {
          setTradeResult((prev) => ({ ...prev, status: "idle" }));
        }, 5000);
      } else {
        setTimeLeft(timeRemaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTrade, marketData, user]);

  if (!user) {
    return (
      <Layout title="Giao dịch - London SSI">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Đang chuyển hướng...</div>
        </div>
      </Layout>
    );
  }

  const handleAction = (action: string) => {
    if (!amount) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập số tiền đặt lệnh",
      });
    } else if (Number.parseFloat(amount) < (user?.minimumBet || 0)) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: `Số tiền đặt lệnh tối thiểu là: ${user.minimumBet?.toLocaleString()} VND`,
      });
    } else if (Number.parseFloat(amount) > user.balance) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Số dư không đủ để thực hiện giao dịch này",
      });
    } else {
      setSelectedAction(action);
      setIsConfirming(true);
    }
  };

  const confirmAction = () => {
    if (!selectedAction) return;

    const entryPrice = marketData.find((item) => item.symbol === "XAU/USD")?.price || 0;
    const tradeAmount = Number(amount);

    // Start the trade
    setActiveTrade({
      direction: selectedAction === DI ? "UP" : "DOWN",
      entryPrice,
      amount: tradeAmount,
      endTime: Date.now() + 60000, // 60 seconds from now
    });

    // Deduct amount from balance (in a real app, this would be an API call)
    if (user) {
      user.balance = (user.balance || 0) - tradeAmount;
    }

    setIsConfirming(false);
    setSelectedAction(null);
    setAmount("");

    toast({
      title: "Đã đặt lệnh thành công",
      description: `Đã đặt lệnh ${selectedAction === DI ? "TĂNG" : "GIẢM"} với giá ${entryPrice.toFixed(2)}`,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const handleAmountClick = (value: number) => {
    setAmount(value.toString());
  };

  const getTimeFrameLabel = (value: string) => {
    return TIME_FRAMES.find((tf) => tf.value === value)?.label || value;
  };

  const handleRefreshMarketData = async () => {
    setIsLoading(true);
    try {
      const data = await getMarketData();
      setMarketData(data);
      setIsLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout title="Giao dịch - London SSI">
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        {/* Trade Result Modals */}
        <Dialog
          open={tradeResult.status === "win"}
          onOpenChange={(open) => !open && setTradeResult({ status: "idle" })}
        >
          <DialogContent className="sm:max-w-[425px] bg-gray-800 border-green-500">
            <DialogHeader>
              <DialogTitle className="text-green-500 text-2xl text-center">
                Chúc mừng bạn đã thắng!
              </DialogTitle>
              <DialogDescription className="text-center text-white">
                Bạn đã kiếm được{" "}
                {tradeResult.profit ? formatCurrency(tradeResult.profit) : 0} VND
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-gray-400">Lệnh:</div>
                <div className="text-white">
                  {tradeResult.direction === "UP" ? "TĂNG" : "GIẢM"}
                </div>

                <div className="text-gray-400">Giá vào lệnh:</div>
                <div className="text-white">
                  {tradeResult.entryPrice?.toFixed(2)}
                </div>

                <div className="text-gray-400">Giá thoát lệnh:</div>
                <div className="text-white">
                  {tradeResult.exitPrice?.toFixed(2)}
                </div>

                <div className="text-gray-400">Số tiền:</div>
                <div className="text-white">
                  {tradeResult.amount ? formatCurrency(tradeResult.amount) : 0} VND
                </div>

                <div className="text-gray-400">Lợi nhuận:</div>
                <div className="text-green-500 font-bold">
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

        <Dialog
          open={tradeResult.status === "lose"}
          onOpenChange={(open) => !open && setTradeResult({ status: "idle" })}
        >
          <DialogContent className="sm:max-w-[425px] bg-gray-800 border-red-500">
            <DialogHeader>
              <DialogTitle className="text-red-500 text-2xl text-center">
                Rất tiếc bạn đã thua!
              </DialogTitle>
              <DialogDescription className="text-center text-white">
                Bạn đã mất{" "}
                {tradeResult.amount ? formatCurrency(tradeResult.amount) : 0} VND
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-gray-400">Lệnh:</div>
                <div className="text-white">
                  {tradeResult.direction === "UP" ? "TĂNG" : "GIẢM"}
                </div>

                <div className="text-gray-400">Giá vào lệnh:</div>
                <div className="text-white">
                  {tradeResult.entryPrice?.toFixed(2)}
                </div>

                <div className="text-gray-400">Giá thoát lệnh:</div>
                <div className="text-white">
                  {tradeResult.exitPrice?.toFixed(2)}
                </div>

                <div className="text-gray-400">Số tiền:</div>
                <div className="text-white">
                  {tradeResult.amount ? formatCurrency(tradeResult.amount) : 0} VND
                </div>

                <div className="text-gray-400">Lỗ:</div>
                <div className="text-red-500 font-bold">
                  -{tradeResult.amount ? formatCurrency(tradeResult.amount) : 0} VND
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setTradeResult({ status: "idle" })}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Trade Dialog */}
        <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
          <DialogContent className="sm:max-w-[425px] bg-gray-800 border-blue-500">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Xác nhận lệnh</DialogTitle>
              <DialogDescription className="text-gray-300">
                Bạn có chắc chắn muốn đặt lệnh {selectedAction} với số tiền{" "}
                {amount ? formatCurrency(Number(amount)) : 0} VND?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-gray-400">Loại lệnh:</div>
                <div
                  className={`font-medium ${
                    selectedAction === DI ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {selectedAction}
                </div>

                <div className="text-gray-400">Số tiền:</div>
                <div className="text-white">
                  {amount ? formatCurrency(Number(amount)) : 0} VND
                </div>

                <div className="text-gray-400">Thời gian:</div>
                <div className="text-white">{getTimeFrameLabel(timeFrame)}</div>

                <div className="text-gray-400">Tỷ lệ thắng:</div>
                <div className="text-green-500">80%</div>
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirming(false)}
                className="w-full"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={confirmAction}
                disabled={isTrading}
                className={`w-full ${
                  selectedAction === DI
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isTrading ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div>
          {/* Market Data Ticker */}
          <div className="bg-gray-800 rounded-lg p-3 mb-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-medium">Thị trường</h3>
                <button
                  onClick={handleRefreshMarketData}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                  title="Làm mới dữ liệu"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                {lastUpdated && (
                  <span className="text-xs text-gray-400">
                    Cập nhật: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {isLoading ? (
                <div className="flex-1 text-center text-gray-400">Đang tải dữ liệu thị trường...</div>
              ) : (
                <div className="flex flex-wrap items-center justify-end gap-4 flex-1">
                  {marketData.map((item) => (
                    <div key={item.symbol} className="flex items-center space-x-2">
                      <span className="text-gray-300 font-medium">{item.symbol}</span>
                      <span className="text-white font-bold">
                        {item.price ? item.price.toFixed(2) : 'N/A'}
                      </span>
                      <span className={`text-sm ${
                        item.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {item.change >= 0 ? '+' : ''}
                        {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chart Area */}
              <div className="lg:col-span-3">
                <Card className="bg-gray-800 border-gray-700 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white text-xl">XAU/USD</CardTitle>
                        <CardDescription className="text-gray-400">
                          Vàng Hoa Kỳ / Đô la Mỹ
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        {TIME_FRAMES.map((tf) => (
                          <Button
                            key={tf.value}
                            variant={timeFrame === tf.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTimeFrame(tf.value)}
                            className="h-8 px-2 text-xs"
                          >
                            {tf.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[500px] p-0">
                    <TradingViewWidget symbol="XAUUSD" interval={timeFrame} />
                  </CardContent>
                </Card>
              </div>

              {/* Order Form */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800 border-gray-700 sticky top-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white text-xl">Đặt lệnh</CardTitle>
                      {activeTrade ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-sm text-yellow-400">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{timeLeft}s</span>
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              activeTrade.direction === "UP"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {activeTrade.direction === "UP" ? "LÊN" : "XUỐNG"} @{" "}
                            {activeTrade.entryPrice.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Chưa có lệnh</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>Số dư khả dụng</span>
                          <span className="text-white font-medium">
                            {formatCurrency(user.balance || 0)} VND
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Cược tối thiểu</span>
                          <span>{formatCurrency(user.minimumBet || 0)} VND</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-white text-sm">
                          Số tiền đặt lệnh (VND)
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {QUICK_AMOUNTS.map((value) => (
                            <Button
                              key={value}
                              type="button"
                              variant={amount === value.toString() ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => handleAmountClick(value)}
                            >
                              +{value.toLocaleString()}
                            </Button>
                          ))}
                        </div>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Nhập số tiền"
                          className="bg-gray-700 border-gray-600 text-white h-12 text-center text-lg font-bold"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="default"
                            size="lg"
                            className={`h-16 text-lg font-bold ${
                              selectedAction === DI
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-green-600/80 hover:bg-green-700/90"
                            }`}
                            onClick={() => handleAction(DI)}
                            disabled={isTrading}
                          >
                            <div className="flex flex-col items-center">
                              <TrendingUp className="w-6 h-6 mb-1" />
                              <span>LÊN</span>
                            </div>
                          </Button>
                          <Button
                            variant="destructive"
                            size="lg"
                            className={`h-16 text-lg font-bold ${
                              selectedAction === nae
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-red-600/80 hover:bg-red-700/90"
                            }`}
                            onClick={() => handleAction(nae)}
                            disabled={isTrading}
                          >
                            <div className="flex flex-col items-center">
                              <TrendingDown className="w-6 h-6 mb-1" />
                              <span>XUỐNG</span>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Data */}
              <div className="md:col-span-2">
                <Card className="bg-gray-800 border-gray-700 h-full">
                  <CardHeader>
                    <Tabs defaultValue="liquidity" className="w-full">
                      <TabsList>
                        <TabsTrigger value="liquidity">Thanh khoản</TabsTrigger>
                        <TabsTrigger value="orders">Lệnh của tôi</TabsTrigger>
                        <TabsTrigger value="history">Lịch sử</TabsTrigger>
                      </TabsList>
                      <TabsContent value="liquidity" className="mt-4">
                        <div className="text-white">
                          <p>Biểu đồ giao dịch sẽ được hiển thị tại đây</p>
                          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                            <h4 className="text-lg font-medium mb-2">
                              Thông tin thị trường
                            </h4>
                            <div className="space-y-1">
                              <p>
                                Giá hiện tại:{" "}
                                <span className="text-green-400">1.2345</span>
                              </p>
                              <p>
                                Thay đổi:{" "}
                                <span className="text-green-400">
                                  +0.0012 (+0.10%)
                                </span>
                              </p>
                              <p>
                                Khối lượng: {formatCurrency(1234567)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="orders">
                        <div className="text-white">
                          <p>Danh sách lệnh đang mở sẽ được hiển thị tại đây</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="history">
                        <div className="text-white">
                          <p>Lịch sử giao dịch sẽ được hiển thị tại đây</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>

          {/* Trade Result Modal */}
          {tradeResult.status === "win" && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-green-600/90 text-white rounded-2xl p-8 max-w-md w-full text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2">GIAO DỊCH THÀNH CÔNG!</h3>
                <p className="text-lg mb-4">
                  Bạn đã thắng{" "}
                  {tradeResult.profit?.toLocaleString()} VND
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-left mb-4">
                  <div>
                    Giá vào:{" "}
                    <span className="font-bold">
                      {tradeResult.entryPrice?.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    Giá ra:{" "}
                    <span className="font-bold">
                      {tradeResult.exitPrice?.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    Hướng:{" "}
                    <span className="font-bold">
                      {tradeResult.direction === "UP" ? "TĂNG" : "GIẢM"}
                    </span>
                  </div>
                  <div>
                    Số tiền:{" "}
                    <span className="font-bold">
                      {tradeResult.amount?.toLocaleString()} VND
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    setTradeResult((prev) => ({ ...prev, status: "idle" }))
                  }
                  className="w-full bg-white text-green-700 hover:bg-green-100 font-bold"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}

          {tradeResult.status === "lose" && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-red-600/90 text-white rounded-2xl p-8 max-w-md w-full text-center">
                <div className="text-4xl mb-4">😢</div>
                <h3 className="text-2xl font-bold mb-2">GIAO DỊCH THẤT BẠI</h3>
                <p className="text-lg mb-4">
                  Bạn đã mất{" "}
                  {Math.abs(tradeResult.profit || 0).toLocaleString()} VND
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-left mb-4">
                  <div>
                    Giá vào:{" "}
                    <span className="font-bold">
                      {tradeResult.entryPrice?.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    Giá ra:{" "}
                    <span className="font-bold">
                      {tradeResult.exitPrice?.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    Hướng:{" "}
                    <span className="font-bold">
                      {tradeResult.direction === "UP" ? "TĂNG" : "GIẢM"}
                    </span>
                  </div>
                  <div>
                    Số tiền:{" "}
                    <span className="font-bold">
                      {tradeResult.amount?.toLocaleString()} VND
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    setTradeResult((prev) => ({ ...prev, status: "idle" }))
                  }
                  className="w-full bg-white text-red-700 hover:bg-red-100 font-bold"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Trade;