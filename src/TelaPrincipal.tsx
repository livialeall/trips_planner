import { useEffect, useState } from 'react';
import './index.css';
import ProgressBar from './Components/ProgressBar';
import { db } from './firebase'; // import do firebase configurado
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import MonthlyBarChart from './MonthlyBarChart';
import 'react-toastify/dist/ReactToastify.css';

const people = ['Lívia', 'Renê', 'Sálvia', 'Matheus', 'Alexandre', 'Thais', 'Guilherme', 'Mariana'];
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

type PersonContribution = {
  caixinha: number;
  casa: number;
};

type MonthContributions = {
  [person: string]: PersonContribution;
};

type AllContributions = {
  [month: string]: MonthContributions;
};

function CountdownBox() {
  const [daysLeft, setDaysLeft] = useState('Calculando...');
  const date = new Date('2025-11-21');
  const targetDatePtBr = date.toLocaleDateString('pt-BR');
  const targetDate = date.getTime();

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      const days = Math.ceil(distance / (1000 * 60 * 60 * 24));
      setDaysLeft(days > 0 ? `${days}` : 'Chegou o grande dia! 🎉');
    };
    update();
    const interval = setInterval(update, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-box">
      <span>⏳ Faltam <strong> {daysLeft}  </strong> dias</span>
      <div className='target-date'><strong>Dia da viagem:</strong> {targetDatePtBr}</div>
    </div>
  );
}

function CostSummary({ onEstimatedCostChange, onCostsChange, initialCosts }: { onEstimatedCostChange: (totalCost: number) => void, onCostsChange: (costs: any) => void, initialCosts: any }) {
  const [costs, setCosts] = useState({
    transportation: 0,
    food: 0,
    accommodation: 0,
  });

  useEffect(() => {
    if (initialCosts) {
      setCosts(initialCosts);
    }
  }, [initialCosts]);

  const totalCost = costs.transportation + costs.food + costs.accommodation;

  const handleChange = (key: keyof typeof costs, value: number) => {
    const updatedCosts = { ...costs, [key]: value };
    setCosts(updatedCosts);
    onEstimatedCostChange(
      updatedCosts.transportation + updatedCosts.food + updatedCosts.accommodation
    );
    onCostsChange(updatedCosts);
  };

  return (
    <section>
      <hgroup>
        <h2>Estimativa de Custos da Viagem</h2>
        <h3>Detalhamento por Categoria</h3>
      </hgroup> 
      <table>
        <thead>
          <tr><th>Categoria</th><th>Valor Estimado</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Transporte</td>
            <td>
              <input
                type="number"
                value={costs.transportation ?? 0}
                onChange={(e) => handleChange('transportation', Number(e.target.value))}
              />
            </td>
          </tr>
          <tr>
            <td>Alimentação</td>
            <td>
              <input
                type="number"
                value={costs.food ?? 0}
                onChange={(e) => handleChange('food', Number(e.target.value))}
              />
            </td>
          </tr>
          <tr>
            <td>Hospedagem</td>
            <td>
              <input
                type="number"
                value={costs.accommodation ?? 0}
                onChange={(e) => handleChange('accommodation', Number(e.target.value))}
              />
            </td>
          </tr>
          <tr style={{ fontWeight: 'bold', backgroundColor: '#202d36' }}>
            <th>Total</th>
            <th>R$ {totalCost.toFixed(2)}</th>
          </tr>
          <tr style={{ fontWeight: 'bold', backgroundColor: '#005a79' }}>
            <th>Total unitário</th>
            <th>R$ {(totalCost / people.length).toFixed(2)}</th>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function MonthlyContribution({
  month,
  onMonthDataChange,
  initialMonthData,
}: {
  month: string;
  onMonthDataChange: (month: string, data: any) => void;
  initialMonthData: any;
}) {
  const [contributions, setContributions] = useState(
    people.reduce((acc, person) => {
      acc[person] = {
        caixinha: initialMonthData?.[person]?.caixinha ?? 0,
        casa: initialMonthData?.[person]?.casa ?? 0,
      };
      return acc;
    }, {} as MonthContributions)
  );

  useEffect(() => {
    setContributions(
      people.reduce((acc, person) => {
        acc[person] = {
          caixinha: initialMonthData?.[person]?.caixinha ?? 0,
          casa: initialMonthData?.[person]?.casa ?? 0,
        };
        return acc;
      }, {} as MonthContributions)
    );
  }, [initialMonthData]); // <- ESSENCIAL

  const handleChange = (person: string, key: 'caixinha' | 'casa', value: number) => {
    const updated = { ...contributions };
    updated[person] = {
      ...updated[person],
      [key]: value,
    };
    setContributions(updated);
    onMonthDataChange(month, updated);
  };

  const caixinhaTotal = Object.values(contributions).reduce(
    (acc, contrib) => acc + contrib.caixinha,
    0
  );
  const casaTotal = Object.values(contributions).reduce(
    (acc, contrib) => acc + contrib.casa,
    0
  );

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
          {people.map((person) => (
            <tr key={person}>
              <td>{person}</td>
              <td>
                <input
                  type="number"
                  value={contributions[person]?.caixinha ?? 0}
                  onChange={(e) => handleChange(person, 'caixinha', Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={contributions[person]?.casa ?? 0}
                  onChange={(e) => handleChange(person, 'casa', Number(e.target.value))}
                />
              </td>
            </tr>
          ))}
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

function Contributions({ onTotalContributionsChange, onContributionsChange, initialContributions }: { onTotalContributionsChange: (total: number) => void, onContributionsChange: (data: any) => void, initialContributions: any }) {
  const [monthlyData, setMonthlyData] = useState<AllContributions>({});

  useEffect(() => {
    if (initialContributions) {
      setMonthlyData(initialContributions);
    }
  }, [initialContributions]);

  useEffect(() => {
    const total = Object.values(monthlyData).reduce((acc, month: any) => {
      const monthTotal = Object.values(month).reduce((sum: any, person: any) => sum + person.caixinha + person.casa, 0);
      return (acc as number) + (monthTotal as number );
    }, 0);
    onTotalContributionsChange(total as number);
  }, [monthlyData, onTotalContributionsChange]);

  const handleMonthDataChange = (month: string, data: any) => {
    setMonthlyData(prev => {
      const updated = { ...prev, [month]: data };
      onContributionsChange(updated);
      return updated;
    });
  };

  return (
    <section>
      <hgroup>
        <h2>Contribuições Mensais</h2>
        <h3>Distribuída por viajante</h3>
      </hgroup>
      <div className="contributions-scroll">
       {months.map((month) => (
          <MonthlyContribution
            key={month}
            month={month}
            initialMonthData={monthlyData[month] ?? {}}
            onMonthDataChange={handleMonthDataChange}
          />
        ))}
      </div>
    </section>
  );
}

function TelaPrincipal() {
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [costs, setCosts] = useState({});
  const [contributions, setContributions] = useState<AllContributions>({});
  const [totalContributions, setTotalContributions] = useState(0);
  const [totalCaixinha, setTotalCaixinha] = useState(0);
  const [totalCasa, setTotalCasa] = useState(0);

  const calculateTotals = (allContributions: AllContributions) => {
    let caixinhaSum = 0;
    let casaSum = 0;

    Object.values(allContributions).forEach(month => {
      Object.values(month).forEach(personContrib => {
        caixinhaSum += personContrib.caixinha ?? 0;
        casaSum += personContrib.casa ?? 0;
      });
    });

    setTotalCaixinha(caixinhaSum);
    setTotalCasa(casaSum);
    setTotalContributions(caixinhaSum + casaSum);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const costsDoc = await getDoc(doc(db, "tripData", "costs"));
        if (costsDoc.exists()) {
          const fetchedCosts = costsDoc.data();
          setCosts(fetchedCosts);

          const totalFetchedCost = (fetchedCosts.transportation || 0) + (fetchedCosts.food || 0) + (fetchedCosts.accommodation || 0);
          setEstimatedCost(totalFetchedCost);
        }

        const monthsSnapshot = await getDocs(collection(db, "tripData", "contributions", "months"));
        const contributionsData: any = {};
        monthsSnapshot.forEach((docSnap) => {
          contributionsData[docSnap.id] = docSnap.data();
        });

        setContributions(contributionsData);
        calculateTotals(contributionsData);
      } catch (error) {
        console.error("Erro ao buscar dados do Firebase:", error);
      }
    };

    fetchData();
  }, []);

  // Atualiza totais sempre que contributions muda (ex: usuário edita)
  useEffect(() => {
    calculateTotals(contributions);
  }, [contributions]);

  const handleCostsChange = (updatedCosts: any) => {
    setCosts(updatedCosts);
  };

  const handleEstimatedCostChange = (totalCost: number) => {
    setEstimatedCost(totalCost);
  };

  const handleContributionsChange = (updatedContributions: AllContributions) => {
    setContributions(updatedContributions);
  };

  return (
    <div className="container">
      <nav className="nav">
        <strong>Trip Organizer</strong>
        <div className="nav-links">
          <img src="/trips_planner/favicon.png" alt="" />
        </div>
      </nav>

      <main>
        <CountdownBox />
        <CostSummary 
          initialCosts={costs} 
          onEstimatedCostChange={handleEstimatedCostChange} 
          onCostsChange={handleCostsChange} 
        />

        <section className="highlight-box">
          <h3>Totais Arrecadados</h3>
          <div className="totals-display">
            <div className="total-card caixinha">
              <span>Caixinha</span>
              <strong>R$ {totalCaixinha.toFixed(2)}</strong>
            </div>
            <div className="total-card casa">
              <span>Contribuição</span>
              <strong>R$ {totalCasa.toFixed(2)}</strong>
            </div>
          </div>
        </section>

        <section className="highlight-box">
          <h3>Progresso de Arrecadação</h3>
          <ProgressBar
            totalRaised={totalContributions}
            tripTotal={estimatedCost}
          />
        </section>

        <Contributions
          initialContributions={contributions}
          onTotalContributionsChange={setTotalContributions}
          onContributionsChange={handleContributionsChange}
        />
      </main>
    </div>
  );
}

export default TelaPrincipal;
