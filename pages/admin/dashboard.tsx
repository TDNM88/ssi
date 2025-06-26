// pages/admin/dashboard.tsx
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { db } from '@/lib/db';
import { users, transactions, trades } from '@/lib/schema';
import { eq, sql, and, gte, desc, isNotNull } from 'drizzle-orm';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalTrades: number;
    profit: number;
    recentTrades: any[];
    dailyStats: Array<{
      date: string;
      deposits: number;
      withdrawals: number;
      trades: number;
    }>;
  };
}

export default function Dashboard({ stats }: DashboardProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalDeposits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.totalWithdrawals.toLocaleString()} in withdrawals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.profit.toLocaleString()} profit
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.dailyStats}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deposits" fill="#8884d8" name="Deposits" />
                  <Bar dataKey="withdrawals" fill="#82ca9d" name="Withdrawals" />
                  <Bar dataKey="trades" fill="#ffc658" name="Trades" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Direction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentTrades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.user?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trade.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trade.direction === 'UP' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${trade.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trade.status === 'WON' 
                            ? 'bg-green-100 text-green-800' 
                            : trade.status === 'LOST' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(trade.openTime), 'PPpp')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    // Get total users
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    // Get active users (logged in last 30 days)
    const [activeUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          isNotNull(users.lastLogin),
          gte(users.lastLogin, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        )
      );

    // Get total deposits and withdrawals
    const [depositsResult] = await db
      .select({ sum: sql<number>`coalesce(sum(cast(amount as decimal)), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'deposit'),
          eq(transactions.status, 'COMPLETED')
        )
      );

    const [withdrawalsResult] = await db
      .select({ sum: sql<number>`coalesce(sum(cast(amount as decimal)), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'withdrawal'),
          eq(transactions.status, 'COMPLETED')
        )
      );

    // Get total trades and profit
    const [tradesResult] = await db
      .select({ 
        count: sql<number>`count(*)`,
        profit: sql<number>`coalesce(sum(case when status = 'WON' then cast(profit as decimal) else 0 end), 0)`
      })
      .from(trades);

    // Get recent trades with user details
    const recentTrades = await db
      .select({
        id: trades.id,
        symbol: trades.symbol,
        direction: trades.direction,
        amount: trades.amount,
        status: trades.status,
        openTime: trades.openTime,
        user: {
          email: users.email,
          name: users.name,
        },
      })
      .from(trades)
      .leftJoin(users, eq(trades.userId, users.id))
      .orderBy(desc(trades.openTime))
      .limit(10);

    // Get daily stats for the last 7 days
    const dailyStats = await db
      .select({
        date: sql<string>`to_char(timestamp 'epoch' + floor(extract(epoch from "createdAt") / 86400) * 86400 * interval '1 second', 'YYYY-MM-DD')`.as('date'),
        deposits: sql<number>`COALESCE(sum(case when type = 'deposit' and status = 'COMPLETED' then amount::decimal else 0 end), 0)`.as('deposits'),
        withdrawals: sql<number>`COALESCE(sum(case when type = 'withdrawal' and status = 'COMPLETED' then amount::decimal else 0 end), 0)`.as('withdrawals'),
        trades: sql<number>`count(distinct case when type = 'trade' then id end)`.as('trades'),
      })
      .from(transactions)
      .where(gte(transactions.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`to_char(timestamp 'epoch' + floor(extract(epoch from "createdAt") / 86400) * 86400 * interval '1 second', 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(timestamp 'epoch' + floor(extract(epoch from "createdAt") / 86400) * 86400 * interval '1 second', 'YYYY-MM-DD')`);

    return {
      props: {
        stats: {
          totalUsers: Number(totalUsersResult?.count) || 0,
          activeUsers: Number(activeUsersResult?.count) || 0,
          totalDeposits: Number(depositsResult?.sum) || 0,
          totalWithdrawals: Number(withdrawalsResult?.sum) || 0,
          totalTrades: Number(tradesResult?.count) || 0,
          profit: Number(tradesResult?.profit) || 0,
          recentTrades: recentTrades.map(trade => ({
            ...trade,
            openTime: trade.openTime.toISOString(),
          })),
          dailyStats: dailyStats.map(stat => ({
            ...stat,
            deposits: Number(stat.deposits) || 0,
            withdrawals: Number(stat.withdrawals) || 0,
            trades: Number(stat.trades) || 0,
          })),
        },
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      props: {
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalTrades: 0,
          profit: 0,
          recentTrades: [],
          dailyStats: [],
        },
      },
    };
  }
};