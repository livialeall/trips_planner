import { useEffect, useState } from 'react';
import './index.css';
import ProgressBar from './Components/ProgressBar';

const people = ['Lívia', 'Renê', 'Sálvia', 'Matheus', 'Alexandre', 'Thais', 'Guilherme', 'Mariana'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function CountdownBox() {
  const [daysLeft, setDaysLeft] = useState('Calculando...');
  const date = new Date('2025-11-21')
  const targetDatePtBr = date.toLocaleDateString('pt-BR')
  const targetDate = date.getTime();

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      const days = Math.ceil(distance / (1000 * 60 * 60 * 24));
      setDaysLeft(days > 0 ? `${days} dias restantes` : 'Chegou o grande dia! 🎉');
    };
    update();
    const interval = setInterval(update, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-box">
      <strong>⏳ Contagem Regressiva:</strong> <span>{daysLeft}</span>
      <div className='target-date'><strong>Dia da viagem:</strong> {targetDatePtBr}</div>
    </div>
  );
}

function CostSummary({ onEstimatedCostChange } : {onEstimatedCostChange: (totalCost: number) => void }) {
  const [costs, setCosts] = useState({
    transportation: 0,
    food: 0,
    accommodation: 0,
  });

  const totalCost = costs.transportation + costs.food + costs.accommodation;

  useEffect(() => {
    onEstimatedCostChange(totalCost);
  }, [costs, onEstimatedCostChange]);

  const handleChange = (key: string, value: number) => {
    setCosts((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section>
      <hgroup>
        <h2>Custos da Viagem</h2>
        <h3>Custos estimados por categoria</h3>
      </hgroup>
      <table>
        <thead>
          <tr><th>Categoria</th><th>Valor Estimado</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Transporte</td>
            <td><input type="number" value={costs.transportation} onChange={(e) => handleChange('transportation', Number(e.target.value))} /></td>
          </tr>
          <tr>
            <td>Alimentação</td>
            <td><input type="number" value={costs.food} onChange={(e) => handleChange('food', Number(e.target.value))} /></td>
          </tr>
          <tr>
            <td>Hospedagem</td>
            <td><input type="number" value={costs.accommodation} onChange={(e) => handleChange('accommodation', Number(e.target.value))} /></td>
          </tr>
          <tr style={{ fontWeight: 'bold', backgroundColor: '#202d36' }}>
            <th>Total</th>
            <th>{totalCost}</th>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function MonthlyContribution({ month, onMonthTotalChange }: { month: string; onMonthTotalChange: (month: string, total: number) => void }) {
  const [contributions, setContributions] = useState(
    people.map(() => ({ caixinha: 0, casa: 0 }))
  );

  const caixinhaTotal = contributions.reduce((acc, contrib) => acc + contrib.caixinha, 0);
  const casaTotal = contributions.reduce((acc, contrib) => acc + contrib.casa, 0);

  useEffect(() => {
    onMonthTotalChange(month, caixinhaTotal + casaTotal);
  }, [contributions, month, onMonthTotalChange]);

  const handleChange = (index: number, key: 'caixinha' | 'casa', value: number) => {
    const updated = [...contributions];
    updated[index][key] = value;
    setContributions(updated);
  };

  return (
    <details>
      <summary>{month} - Total: R$ {(caixinhaTotal + casaTotal).toFixed(2)}</summary>
      <table>
        <thead>
          <tr>
            <th>Viajante</th>
            <th>Caixinha</th>
            <th>Casa</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person, idx) => (
            <tr key={person}>
              <td>{person}</td>
              <td>
                <input
                  type="number"
                  value={contributions[idx].caixinha}
                  onChange={(e) => handleChange(idx, 'caixinha', Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={contributions[idx].casa}
                  onChange={(e) => handleChange(idx, 'casa', Number(e.target.value))}
                />
              </td>
            </tr>
          ))}
          {/* Linha Total separando Caixinha e Casa */}
          <tr style={{ fontWeight: 'bold', backgroundColor: '#202d36' }}>
            <td>Total</td>
            <td>R$ {caixinhaTotal.toFixed(2)}</td>
            <td>R$ {casaTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </details>
  );
}


function Contributions({ onTotalContributionsChange } : {onTotalContributionsChange: (total: number) => void} ) {
  const [monthlyTotals, setMonthlyTotals] = useState({});

  useEffect(() => {
    const total = Object.values(monthlyTotals).reduce((acc, val) => (acc as number) + (val as number), 0);
    onTotalContributionsChange(total as number);
  }, [monthlyTotals, onTotalContributionsChange]);

  const handleMonthTotalChange = (month: string, total: number) => {
    setMonthlyTotals(prev => ({ ...prev, [month]: total }));
  };

  return (
    <section>
      <hgroup>
        <h2>Contribuição</h2>
        <h3>por viajante, por mês</h3>
      </hgroup>
      <div className="contributions-scroll">
        {months.map((month) => (
          <MonthlyContribution key={month} month={month} onMonthTotalChange={handleMonthTotalChange} />
        ))}
      </div>
    </section>
  );
}

function App() {
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);

  return (
    <div className="container">
      <nav className="nav">
        <strong>Trip Organizer</strong>
        <div className="nav-links">
          {/* <a href="#">Home</a>
          <a href="#">Trips</a>
          <a href="#" className="button">New Trip</a> */}
          <img src="/trips_planner/favicon.png" alt="" />
        </div>
      </nav>

      <main>
        <CountdownBox />
        <div className="grid">
          <CostSummary onEstimatedCostChange={setEstimatedCost} />
        <h3>Barra de evolução financeira</h3>
        <ProgressBar totalRaised={totalContributions} tripTotal={estimatedCost} />
          <Contributions onTotalContributionsChange={setTotalContributions} />
        </div>
      </main>

      <footer>
        <small>Powered by <div>&lt;LEAL&gt;</div></small>
      </footer>
    </div>
  );
}

export default App;
