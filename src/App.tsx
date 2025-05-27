import Login from './Login';
import TelaPrincipal from './TelaPrincipal';

function App() {
  return (
    <Login onAuthenticated={function (): void {
          throw new Error('Function not implemented.');
      } }></Login>
  );
}

export default App;
