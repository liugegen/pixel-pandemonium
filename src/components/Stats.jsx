import React, { useState, useEffect } from 'react';
import { useMultisynq } from './MultisynqProvider';
import { useAccount } from 'wagmi';

const Stats = () => {
  const [playerStats, setPlayerStats] = useState({});
  const [totalPixels, setTotalPixels] = useState(0);
  const session = useMultisynq();
  const { address } = useAccount();

  useEffect(() => {
    if (!session) return;

    const handleStatsUpdate = (stats) => {
      setPlayerStats(stats.playerStats || {});
      setTotalPixels(stats.totalPixels || 0);
    };

    session.view.subscribe("canvasScope", "statsUpdated", handleStatsUpdate);
    
    if (session.model.playerStats) {
      setPlayerStats(session.model.playerStats);
      setTotalPixels(session.model.totalPixels || 0);
    }

    return () => session.view.unsubscribe("canvasScope", "statsUpdated", handleStatsUpdate);
  }, [session]);

  const myStats = address ? playerStats[address.toLowerCase()] : null;
  const topPlayers = Object.entries(playerStats)
    .sort(([,a], [,b]) => b.pixelsPlaced - a.pixelsPlaced)
    .slice(0, 5);

  return (
    <div className="stats-container">
      <h3>Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{totalPixels}</div>
          <div className="stat-label">Total Pixels</div>
        </div>
        
        {myStats && (
          <div className="stat-item">
            <div className="stat-value">{myStats.pixelsPlaced || 0}</div>
            <div className="stat-label">Your Pixels</div>
          </div>
        )}
      </div>

      {topPlayers.length > 0 && (
        <div className="leaderboard">
          <h4>🏆 Top Players</h4>
          {topPlayers.map(([playerAddress, stats], index) => (
            <div key={playerAddress} className="leaderboard-item">
              <span className="rank">#{index + 1}</span>
              <span className="address">{playerAddress.slice(0, 6)}...{playerAddress.slice(-4)}</span>
              <span className="pixels">{stats.pixelsPlaced} pixels</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stats;
