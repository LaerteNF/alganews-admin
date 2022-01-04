import { Metric } from "laerte_fernandes-sdk";

export default function transformDataIntoAntdChart(
  data: Metric.MonthlyRevenuesExpenses
) {
  return data
    .map((item) => {
      return [
        {
          yearMonth: item.yearMonth,
          value: item.totalRevenues,
          category: "totalRevenues" as "totalRevenues" | "totalExpenses",
        },
        {
          yearMonth: item.yearMonth,
          value: item.totalExpenses,
          category: "totalExpenses" as "totalRevenues" | "totalExpenses",
        },
      ];
    })
    .flat();
}
