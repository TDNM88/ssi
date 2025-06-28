"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useMockUser, type User } from "@/lib/mock-user";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowUp, ArrowDown, Clock, BarChart2, DollarSign, RefreshCw, ChevronDown, Plus, Minus } from "lucide-react";
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
import TradingViewMarketOverview from "../components/TradingViewMarketOverview";
import MarketDataTicker from "../components/MarketDataTicker";
import TradingViewSymbolOverview from "../components/TradingViewSymbolOverview";
import TradingViewAdvancedChart from "../components/TradingViewAdvancedChart";

// Constants
const QUICK_AMOUNTS = [100000, 1000000, 5000000, 10000000, 30000000, 50000000, 100000000, 200000000];
const TIME_FRAMES = [
  { value: "1", label: "1 phút" },
  { value: "5", label: "5 phút" },
  { value: "15", label: "15 phút" },
];

const Trade = () => {
  const { toast } = useToast();
  const user = useMockUser();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [timeFrame, setTimeFrame] = useState("1");
  const [sessionId, setSessionId] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [selectedAction, setSelectedAction] = useState<"UP" | "DOWN" | null>(null);
  const [marketData, setMarketData] = useState([
    { symbol: "XAU/USD", price: 2337.16, change: 12.5, changePercent: 0.54 },
    { symbol: "OIL", price: 85.20, change: -0.45, changePercent: -0.53 },
  ]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTrade, setActiveTrade] = useState<{
    direction: "UP" | "DOWN";
    entryPrice: number;
    amount: number;
    endTime: number;
  } | null>(null);

  // Order panel helpers
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // session countdown every second
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // start new session
          setSessionId((id) => id + 1);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const adjustAmount = (delta: number) => {
    setAmount((prev) => {
      const value = parseInt(prev || "0", 10);
      const newVal = Math.max(0, value + delta * 100000);
      return newVal.toString();
    });
  };

  const addAmount = (increment: number) => {
    setAmount((prev) => {
      const value = parseInt(prev.replace(/,/g, "") || "0", 10);
      return (value + increment).toString();
    });
  };

  const formatAmount = (val: string) => {
    if (!val) return "";
    return Number(val.replace(/,/g, "")).toLocaleString("en-US");
  };

  const [tradeResult, setTradeResult] = useState<{
    status: "idle" | "win" | "lose" | "processing";
    direction?: "UP" | "DOWN";
    entryPrice?: number;
    exitPrice?: number;
    amount?: number;
    profit?: number;
  }>({ status: "idle" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Giả lập dữ liệu từ MarketDataTicker
        setMarketData([
          { symbol: "XAU/USD", price: 2337.16, change: 12.5, changePercent: 0.54 },
          { symbol: "OIL", price: 85.20, change: -0.45, changePercent: -0.53 },
        ]);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching market data:", error);
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

  useEffect(() => {
    if (!activeTrade) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const timeRemaining = Math.ceil((activeTrade.endTime - now) / 1000);
      if (timeRemaining <= 0) {
        const currentPrice = marketData.find(md => md.symbol === "XAU/USD")?.price || 0;
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
        setTimeout(() => setTradeResult(prev => ({ ...prev, status: "idle" })), 5000);
      } else {
        setTimeLeft(timeRemaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTrade, marketData]);

  useEffect(() => {
    if (user === null) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/trade')}`);
    }
  }, [user, router]);

  const handleAction = (direction: "UP" | "DOWN") => {
    const betAmount = Number(amount.replace(/,/g, ""));
    if (!betAmount || isNaN(betAmount)) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập số tiền hợp lệ" });
      return;
    }
    if (betAmount < 100000) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số tiền tối thiểu là 100,000 VND" });
      return;
    }
    if (user && betAmount > (user.balance || 0)) {
      toast({ variant: "destructive", title: "Lỗi", description: "Số dư không đủ" });
      return;
    }
    setSelectedAction(direction);
    setIsConfirming(true);
  };

  const confirmTrade = () => {
    if (!selectedAction) return;
    const entryPrice = marketData.find(md => md.symbol === "XAU/USD")?.price || 0;
    const tradeAmount = Number(amount.replace(/,/g, ""));
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
      description: `Đã đặt lệnh ${selectedAction === "UP" ? "LÊN" : "XUỐNG"} với giá ${entryPrice.toFixed(2)}`,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
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
                  {tradeResult.direction === "UP" ? "LÊN" : "XUỐNG"}
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

        <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
          <DialogContent className="sm:max-w-[425px] bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Xác nhận đặt lệnh</DialogTitle>
              <DialogDescription className="text-gray-300">
                Bạn có chắc chắn muốn đặt lệnh {selectedAction === "UP" ? "LÊN" : "XUỐNG"} với số tiền {formatCurrency(Number(amount.replace(/,/g, "")))} VND?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-400">Loại lệnh:</div>
                <div className={`font-bold ${
                  selectedAction === "UP" ? "text-green-500" : "text-red-500"
                }`}>
                  {selectedAction === "UP" ? "LÊN" : "XUỐNG"}
                </div>
                <div className="text-gray-400">Số tiền:</div>
                <div className="text-white">{formatCurrency(Number(amount.replace(/,/g, "")))} VND</div>
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
                  selectedAction === "UP" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={confirmTrade}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - 1/3 width */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white border border-gray-300 rounded-md shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ChevronDown className="h-4 w-4 text-gray-700" />
                  <CardTitle className="text-gray-900 text-base font-medium">Số dư</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="py-6 px-4">
                <div className="flex items-center justify-between text-gray-900 text-lg font-semibold uppercase">
                  <span>SỐ DƯ:</span>
                  <span>{formatCurrency(user?.balance ?? 0)} VND</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-300 rounded-md shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ChevronDown className="h-4 w-4 text-gray-700" />
                  <CardTitle className="text-gray-900 text-base font-medium">Đặt lệnh</CardTitle>
                    <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded ml-auto">ID: {sessionId}</span>
                </div>
              </CardHeader>
              <CardContent>  
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="amount" className="text-sm text-gray-400">
                      Số tiền (VND)
                    </label>
                    <span className="text-xs text-gray-400">Tối thiểu: {formatCurrency(100000)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={() => addAmount(-100000)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="amount"
                      type="number"
                      value={formatAmount(amount)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, "");
                        if (/^\d*$/.test(raw)) setAmount(raw);
                      }}

                      placeholder="Nhập số tiền"
                    />
                    <Button variant="outline" size="icon" onClick={() => addAmount(100000)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {QUICK_AMOUNTS.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-sm font-semibold bg-white hover:bg-gray-100"
                        onClick={() => addAmount(value)}
                      >
                        {value >= 1000000 ? `+${value / 1000000}M` : `+${value / 1000}K`}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 mb-4 text-sm text-gray-900">
                  <div className="flex justify-between"><span>Ngày:</span><span>{new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span></div>
                  <div className="flex justify-between"><span>Giờ:</span><span>{new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></div>
                  <div className="flex justify-between font-semibold"><span>Phiên hiện tại:</span><span>{sessionId}</span></div>
                </div>
                <div className="mb-4">
                  <div className="border border-red-600 rounded bg-gray-100 text-center py-3 text-sm text-gray-900">
                    Hãy đặt lệnh: <span className="font-bold text-red-600">{String(timeLeft).padStart(2, '0')}s</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    type="button"
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-lg font-bold flex items-center justify-center"
                    onClick={() => handleAction("UP")}
                    disabled={isLoading || !amount}
                  >
                    LÊN <ArrowUp className="h-5 w-5 ml-2" />
                  </Button>
                  <Button
                    type="button"
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-bold flex items-center justify-center"
                    onClick={() => handleAction("DOWN")}
                    disabled={isLoading || !amount}
                  >
                    XUỐNG <ArrowDown className="h-5 w-5 ml-2" />
                  </Button>
                </div>

                {activeTrade && (
                  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Lệnh đang mở</span>
                      <span className="text-sm text-gray-400">
                        Còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Loại lệnh:</div>
                      <div className={`font-bold ${
                        activeTrade.direction === "UP" ? "text-green-500" : "text-red-500"
                      }`}>
                        {activeTrade.direction === "UP" ? "LÊN" : "XUỐNG"}
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

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Cập nhật</CardTitle>
              </CardHeader>
              <CardContent>
                <MarketDataTicker />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 2/3 width */}
          <div className="lg:col-span-8 space-y-6">
            {/* ----- Chart ----- */}
            <Card className="bg-gray-800 border-gray-700 h-[500px]">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Biểu đồ giá</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Cập nhật: {lastUpdated?.toLocaleTimeString() || "Đang tải..."}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        setIsLoading(true);
                        setTimeout(() => {
                          setMarketData([
                            { symbol: "XAU/USD", price: 2337.16, change: 12.5, changePercent: 0.54 },
                            { symbol: "OIL", price: 85.20, change: -0.45, changePercent: -0.53 },
                          ]);
                          setLastUpdated(new Date());
                          setIsLoading(false);
                        }, 1000);
                      }}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full w-full p-0">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <TradingViewAdvancedChart symbol="TVC:GOLD" interval="1" theme="dark" height={460} interactive={false} />
                )}
              </CardContent>
            </Card>

            {/* ----- History ----- */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Lịch sử lệnh</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Table Header */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700 text-sm text-left text-gray-300">
                    <thead className="bg-gray-700 uppercase text-gray-400">
                      <tr>
                        <th scope="col" className="px-4 py-2 font-medium">Phiên</th>
                        <th scope="col" className="px-4 py-2 font-medium">Loại</th>
                        <th scope="col" className="px-4 py-2 font-medium">Số tiền</th>
                        <th scope="col" className="px-4 py-2 font-medium">Kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* No data */}
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <BarChart2 className="w-8 h-8 mb-2" />
                            <p>Chưa có dữ liệu</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* ----- Liquidity / Market Overview ----- */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Thanh khoản</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TradingViewMarketOverview />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Trade;