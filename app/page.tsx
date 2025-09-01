'use client';
import React, { useEffect, useState } from 'react';
import CommandsList from '../src/components/CommandsList';
import { parseCommandsFromCSV } from '../src/utils/commandParser';
import { CS2Command } from '../src/types/command';

export default function Home() {
  const [commands, setCommands] = useState<CS2Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [particles, setParticles] = useState<Array<{
    id: number;
    size: number;
    left: string;
    duration: string;
    delay: string;
    opacity: number;
    shadowSize: number;
  }>>([]);

  useEffect(() => {
    // Generate particles on client side only
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: `${Math.random() * 100}%`,
      duration: `${30 + Math.random() * 20}s`,
      delay: `${Math.random() * 20}s`,
      opacity: Math.random() * 0.3 + 0.1,
      shadowSize: Math.random() * 20 + 10
    }));
    setParticles(generatedParticles);

    // Load commands from CSV file
    fetch('/commands.csv')
      .then(response => response.text())
      .then(text => {
        const parsedCommands = parseCommandsFromCSV(text);
        setCommands(parsedCommands);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load commands:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(139, 92, 246, 0.3)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'smoothSpin 2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}></div>
          <div style={{
            color: '#8b5cf6',
            fontSize: '18px',
            fontWeight: '600',
            animation: 'fadeInOut 2s ease-in-out infinite'
          }}>
            Loading CS2 commands...
          </div>
        </div>
        <style jsx>{`
          @keyframes smoothSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        {/* Smooth Gradient Orbs */}
        <div style={{
          position: 'absolute',
          width: '40vw',
          height: '40vw',
          maxWidth: '600px',
          maxHeight: '600px',
          background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.25) 0%, transparent 50%)',
          borderRadius: '50%',
          top: '-10%',
          right: '-10%',
          animation: 'smoothPulse 15s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          maxWidth: '700px',
          maxHeight: '700px',
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
          borderRadius: '50%',
          bottom: '-15%',
          left: '-15%',
          animation: 'smoothPulse 18s cubic-bezier(0.4, 0, 0.6, 1) infinite 3s',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          width: '35vw',
          height: '35vw',
          maxWidth: '500px',
          maxHeight: '500px',
          background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.15) 0%, transparent 50%)',
          borderRadius: '50%',
          top: '40%',
          left: '30%',
          animation: 'gentleDrift 20s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          filter: 'blur(50px)'
        }} />
        
        {/* Subtle Grid Pattern */}
        <div style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          left: '-50%',
          top: '-50%',
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'smoothGridMove 60s linear infinite',
          opacity: 0.7
        }} />
        
        {/* Smooth Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `rgba(139, 92, 246, ${particle.opacity})`,
              borderRadius: '50%',
              left: particle.left,
              bottom: '-10px',
              animation: `smoothFloat ${particle.duration} cubic-bezier(0.4, 0, 0.2, 1) infinite`,
              animationDelay: particle.delay,
              boxShadow: `0 0 ${particle.shadowSize}px rgba(139, 92, 246, 0.2)`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
        
        {/* Smooth Wave Effect */}
        <div style={{
          position: 'absolute',
          width: '200%',
          height: '100%',
          bottom: 0,
          left: '-50%',
          background: `linear-gradient(180deg, 
            transparent 0%, 
            transparent 70%, 
            rgba(139, 92, 246, 0.02) 85%, 
            rgba(139, 92, 246, 0.04) 100%
          )`,
          animation: 'smoothWave 25s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        paddingTop: '40px',
      }}>
        <CommandsList commands={commands} />

        {/* Footer */}
        <footer style={{
          marginTop: '80px',
          padding: '40px 20px',
          borderTop: '1px solid rgba(139, 92, 246, 0.1)',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          background: 'rgba(26, 26, 46, 0.6)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
          <p style={{
            color: '#8b5cf6',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            CS2 Console Commands Reference
          </p>
          <p style={{
            color: '#6b6b80',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            Complete list of Counter-Strike 2 console commands • {commands.length} commands indexed
          </p>
          <div style={{
            marginTop: '20px',
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <a
              href="https://github.com/omar-anwari/CS-Console-Commands"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#a1a1aa',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                background: 'rgba(139, 92, 246, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.color = '#8b5cf6';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.color = '#a1a1aa';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <span style={{
              color: '#4a4a5a',
              fontSize: '14px'
            }}>
              •
            </span>
            <span style={{
              color: '#6b6b80',
              fontSize: '14px'
            }}>
              Commands updated occasionally
            </span>
          </div>
          
          {/* Additional Info */}
          <div style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            <p style={{
              color: '#4a4a5a',
              fontSize: '12px',
              lineHeight: '1.6'
            }}>
              Commands sourced from CS2 console • Use at your own discretion
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes smoothSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes smoothFloat {
          0% {
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            transform: translateY(-10vh) translateX(10px) scale(1);
            opacity: 1;
          }
          90% {
            transform: translateY(-90vh) translateX(-10px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(0) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes smoothPulse {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            opacity: 0.5;
          }
          25% {
            transform: scale(1.05) translate(-10px, 10px);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1) translate(10px, -10px);
            opacity: 0.7;
          }
          75% {
            transform: scale(1.05) translate(-5px, -5px);
            opacity: 0.6;
          }
        }
        
        @keyframes gentleDrift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
        
        @keyframes smoothGridMove {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            transform: translate(60px, 60px) rotate(0.5deg);
          }
        }
        
        @keyframes smoothWave {
          0%, 100% {
            transform: translateX(0) scaleY(1);
          }
          50% {
            transform: translateX(50px) scaleY(1.1);
          }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        /* Responsive styles for footer */
        @media (max-width: 640px) {
          footer {
            padding: 30px 15px !important;
            margin-top: 60px !important;
          }
          footer p:first-child {
            font-size: 14px !important;
          }
          footer p {
            font-size: 12px !important;
          }
        }
      `}</style>
    </main>
  );
}
