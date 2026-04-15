// services/admin.service.ts
import { prisma } from "@/lib/prisma";

export async function getGlobalStats() {
  const [totalUsers,totalSeries,recentSeries,recentAttempts,activeUsersLast7Days] = await Promise.all([prisma.user.count(),prisma.series.count({where:{endedAt:{not:null}}}),prisma.series.findMany({where:{endedAt:{not:null}},select:{score:true},take:1000,orderBy:{endedAt:"desc"}}),prisma.attempt.count({where:{createdAt:{gte:new Date(Date.now()-7*24*60*60*1000)}}}),prisma.user.count({where:{attempts:{some:{createdAt:{gte:new Date(Date.now()-7*24*60*60*1000)}}}}})]);
  const avgScore = recentSeries.length>0?Math.round(recentSeries.reduce((s,x)=>s+(x.score??0),0)/recentSeries.length):0;
  return {totalUsers,activeUsers7d:activeUsersLast7Days,totalSeries,avgScore,attemptsLast7d:recentAttempts};
}

export async function getUsersWithStats(page=1,limit=20) {
  const skip=(page-1)*limit;
  const users=await prisma.user.findMany({skip,take:limit,orderBy:{createdAt:"desc"},where:{role:"student"},include:{readiness:{orDerBy:{computedAt:"desc"},take:1},weaknessScores:{orderBy:{score:"desc"},take:3},series:{where:{endedAt:{not:null}},orderBy:{endedAt:"desc"},take:1,select:{score:true}}}});
  const total=await prisma.user.count({where:{role:"student"}});
  return {users:users.map(u=>({id:u.id,email:u.email,createdAt:u.createdAt,readiness:u.readiness[0]??null,topWeaknesses:u.weaknessScores,lastScore:u.series[0]?.score??null})),total,pages:Math.ceil(total/limit)};
}

export async function getGlobalTrapAnalytics() {
  const [trapScores,subthemeScores,themeScores]=await Promise.all([prisma.weaknessScore.groupBy({by:["key"],where:{keyType:"trapFamily"},_avg:{score:true},_count:{userId:true},orderBy:{_avg:{score:"desc"}},take:10}),prisma.weaknessScore.groupBy({by:"["key"],where:{keyType:"subtheme"},_avg:{score:true},_count:{userId:true},orderBy:x_avg:{score:"desc"}},take:10}),prisma.weaknessScore.groupBy({by:["key"],where:{keyType:"theme"},_avg:{score:true},_count:{userId:true},orderBy:x_avg:{score:"desc"}},take:8})]);
  return {topTraps:trapScores.map(t=>({key:t.key,avgScore:t._avg.score??0,userCount:t._count.userId})),topSubthemes:subthemeScores.map(t=>({key:t.key,avgScore:t._avg.score??0,userCount:t._count.userId})),topThemes:themeScores.map(t=>({key:t.key,avgScore:t._avg.score??0,userCount:t._count.userId}))};
}
