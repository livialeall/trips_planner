import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

type ChartProps = {
  contributions: {
    [month: string]: {
      [person: string]: { caixinha: number; casa: number };
    };
  };
};
const monthOrder = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

function MonthlyStackedBarChart({ contributions }: ChartProps) {
  const data = Object.entries(contributions)
  .sort(([a], [b]) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
  .map(([month, peopleContrib]) => {
    const caixinhaTotal = Object.values(peopleContrib).reduce((sum, p) => sum + p.caixinha, 0);
    const casaTotal = Object.values(peopleContrib).reduce((sum, p) => sum + p.casa, 0);
    return {
      month,
      caixinha: caixinhaTotal,
      casa: casaTotal,
    };
  });

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left:-20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
            labelFormatter={(label) => `Mês: ${label}`}
            labelStyle={{color: 'black'}}
          />
          <Legend />
          <Bar dataKey="casa" stackId="a" fill="#00B0FF" name="Contribuição"/>
          <Bar dataKey="caixinha" stackId="a" fill="#00E676" name="Caixinha" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyStackedBarChart;
