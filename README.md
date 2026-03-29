# Cases o Turisme — Portal Interactiu 🏡

Benvinguts al codi font del mapa i quadre d'estadístiques obert de **Cases o Turisme: 190.000 oportunitats de recuperar habitatge**. Una eina visual de mapeig ciutadà dissenyada per l'ABDT per donar llum a l'activitat turística irregular no controlada a Barcelona respecte al parc tancat de les plataformes.

Aquest repositori construeix la web Frontend SPA consumint l'API estàtica proveïda per un backend programat externament.

## 🧪 Pila Tecnològica
Aquesta interfície ha estat completament reconstruïda de zero abandonant models legats a favor d'una _experiència prèmium d'usuari_ basada en el disseny _Glassmorphism_ i una _Floating UI_.

- **React 19** amb **Vite** usant CSS Modules i variables _Design Tokens_ globals.
- **React-Leaflet** per la generació de mapes vectorials a pantalla completa, marcadors geoespacials de milers d'entitats (clusterització optimitzada).
- **Chart.js** per generar la narrativa interactiva dinàmica que analitza percentualment quina porció és frau actiu.
- **MDX** per permetre la publicació d'articles incrustats mantenint el control del codi estètic intern.
- Servit mitjançant consultes PUSH al clúster de **Supabase** amb connexió nativa i regles de *Row Level Security* d'alta restricció: la clau insertada aquí **només té permesa la lectura (`SELECT`)** a la DB. 

## 🏗 Desenvolupament Local i Configuració

1. Clona aquest repositori a la teva màquina local:
   ```bash
   git clone https://github.com/pauba5/casesoturisme.git
   cd casesoturisme
   ```

2. Instal·la les llibreries Node (npm):
   ```bash
   npm install
   ```

3. Requisit important: Assigna el teu pont al clúster de Supabase creant un fitxer `.env` a la mateixa carpeta base del projecte amb:
   ```env
   VITE_SUPABASE_URL=la-teva-url
   VITE_SUPABASE_ANON_KEY=el-teu-anon-key-de-lectura
   ```

4. Executar entorn HMR (S'aixeca un localhost ultra ràpid on pots veure qualsevol canvi en directe a la UI sense refrescar):
   ```bash
   npm run dev
   ```

## 🚚 Desplegament
Pensat per compilar i generar absolutament tot el JavaScript/CSS necessari per deixar-ho a punt per a qualsevol servidor de programari lliure (ex: Sindominio).
```bash
npm run build
```
Després només cal copiar la carpeta resultant `dist/` a la nova llar del sistema.
