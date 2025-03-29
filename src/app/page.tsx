import EarthquakeList from '@/components/EarthquakeList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-6">
          🌍 Global Earthquake Monitor
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">About This Monitor</h2>
          <p className="text-gray-700 mb-4">
            Track significant earthquakes worldwide with magnitude 4.0 or greater from the past 7 days. 
            Data updates every 5 minutes from the US Geological Survey (USGS).
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Understanding Earthquake Magnitudes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-700">Magnitude Scale:</h4>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>4.0-5.9: Light to Moderate</li>
                  <li>6.0-6.9: Strong</li>
                  <li>7.0+: Major</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700">What to Expect:</h4>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>🟢 Minor: Felt but rarely causes damage</li>
                  <li>🟡 Moderate: May cause light damage</li>
                  <li>🔴 Severe: Can cause serious damage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <EarthquakeList />
      </div>
    </main>
  );
}
