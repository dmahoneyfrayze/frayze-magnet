import GrowthSimulator from './GrowthSimulator'

function App() {
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';
  return (
    <GrowthSimulator isEmbed={isEmbed} />
  )
}

export default App
