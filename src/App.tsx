import { useEffect, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

// Interface para organizar a lista no app
interface Agendamento {
  id: number;
  tarefa: string;
  data: string;
}

function App() {
  const [tarefa, setTarefa] = useState("");
  const [horario, setHorario] = useState("");
  const [lista, setLista] = useState<Agendamento[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await LocalNotifications.registerActionTypes({
          types: [{
            id: 'REMARCAR_OPCOES',
            actions: [
              { id: 'remarcar', title: 'Remarcar (minutos)', input: true },
              { id: 'concluido', title: 'Concluir', foreground: true }
            ]
          }]
        });

        LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          if (action.actionId === 'remarcar' && action.inputValue) {
            reagendar(action.notification.body || "", parseInt(action.inputValue));
          }
        });
      } catch (e) { console.log("Navegador: Plugins inativos"); }
    };
    init();
  }, []);

  const reagendar = async (msg: string, min: number) => {
    const data = new Date();
    data.setMinutes(data.getMinutes() + min);
    const novoId = Math.floor(Math.random() * 1000000);

    await LocalNotifications.schedule({
      notifications: [{
        title: "Agenday: Remarcado",
        body: msg,
        id: novoId,
        schedule: { at: data, allowWhileIdle: true },
        actionTypeId: 'REMARCAR_OPCOES',
        sound: 'lembrete.wav'
      }]
    });
  };

  const agendarInicial = async () => {
    if (!horario || !tarefa) return alert("Preencha tarefa e horário!");
    
    try {
      const novoId = Math.floor(Math.random() * 1000000); // ID Único aqui
      const dataAgendada = new Date(horario);

      await LocalNotifications.schedule({
        notifications: [{
          title: "Agenday",
          body: tarefa,
          id: novoId,
          schedule: { at: dataAgendada, allowWhileIdle: true },
          actionTypeId: 'REMARCAR_OPCOES',
          sound: 'lembrete.wav'
        }]
      });

      // Adiciona na lista visual
      const novoAgendamento = { id: novoId, tarefa, data: horario };
      setLista([...lista, novoAgendamento]);
      
      setTarefa("");
      setHorario("");
      alert("Agendamento salvo!");
    } catch (e) {
      alert("Erro ao agendar!");
    }
  };

  const cancelar = async (id: number) => {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    setLista(lista.filter(item => item.id !== id));
  };

  return (
    <div style={{ padding: '20px', background: '#121212', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#4CAF50' }}>Agenday Multi 🕒</h2>
      
      <div style={{ background: '#1e1e1e', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <input 
          placeholder="O que precisa fazer?" 
          value={tarefa} 
          onChange={e => setTarefa(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: 'none', background: '#333', color: '#fff' }}
        />
        <input 
          type="datetime-local" 
          value={horario} 
          onChange={e => setHorario(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: 'none', background: '#333', color: '#fff' }}
        />
        <button onClick={agendarInicial} style={{ width: '100%', padding: '12px', background: '#4CAF50', border: 'none', borderRadius: '5px', color: '#fff', fontWeight: 'bold' }}>
          ADICIONAR LEMBRETE
        </button>
      </div>

      <h3>Ativos ({lista.length})</h3>
      {lista.map(item => (
        <div key={item.id} style={{ background: '#252525', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{item.tarefa}</strong><br/>
            <span style={{ fontSize: '12px', color: '#888' }}>{new Date(item.data).toLocaleString('pt-BR')}</span>
          </div>
          <button onClick={() => cancelar(item.id)} style={{ background: '#ff5252', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>
            X
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
