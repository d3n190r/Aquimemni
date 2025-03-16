// frontend/src/components/MainContent.js
import React from 'react';

const Main = ({ children }) => {
  return (
    <main style={{ 
        position: 'fixed',
        top: '70px',
        left: '250px',
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        backgroundColor: '#f8f9fa',
        borderLeft: '1px solid #dee2e6',
        borderTop: '1px solid #dee2e6',
        zIndex: 1000,
    }}>
      <div className="container-fluid">
        <div className="row g-4">
          {children}
        </div>
      </div>
    </main>
  );
};

const StartQuizSection = ({ onStart }) => {
  return (
    <div className="col-12 col-lg-8">
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column align-items-center justify-content-center p-5">
          <h2 className="mb-4 text-primary">Ready for a Challenge?</h2>
          <button 
            className="btn btn-primary btn-lg mb-4 px-5"
            onClick={onStart}
          >
            <i className="bi bi-lightning-charge me-2"></i>
            Demo quiz now
          </button>
          
          <div className="row g-4 w-100">
            <div className="col-md-6">
              <div className="card border-0 bg-light">
                <div className="card-body text-center">
                  <h5 className="text-muted">Daily Streak</h5>
                  <div className="display-4 text-warning">3🔥</div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 bg-light">
                <div className="card-body text-center">
                  <h5 className="text-muted">Your Rank</h5>
                  <div className="display-4 text-success">#42🏆</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorksSection = () => {
  return (
    <div className="col-12 col-lg-8">
      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h4 className="mb-4">How It Works</h4>
          <div className="row g-4">
            {[1, 2, 3].map((step) => (
              <div className="col-md-4" key={step}>
                <div className="bg-light rounded-3 p-3 text-center h-100">
                  <div className="badge bg-primary rounded-circle fs-4 mb-3">{step}</div>
                  <h5>{['Create Quiz', 'Play & Share', 'Track Progress'][step - 1]}</h5>
                  <p className="text-muted small">
                    {[
                      'Craft your own questions or use our generator',
                      'Challenge friends or join public quizzes',
                      'Monitor your learning journey'
                    ][step - 1]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivitySection = () => {
  return (
    <div className="col-12 col-lg-4">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <h4 className="mb-3">Recent Activity</h4>
          <div className="list-group list-group-flush">
            {[
              { icon: 'bi-trophy', text: 'Reached Top 100 Leaderboard', time: '2h ago' },
              { icon: 'bi-chat-dots', text: 'New comment on "JS Basics"', time: '5h ago' },
              { icon: 'bi-people', text: '3 new followers', time: '1d ago' }
            ].map((activity, index) => (
              <div className="list-group-item border-0 py-3" key={index}>
                <div className="d-flex align-items-center">
                  <i className={`bi ${activity.icon} fs-4 text-primary me-3`}></i>
                  <div>
                    <p className="mb-0">{activity.text}</p>
                    <small className="text-muted">{activity.time}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Main, StartQuizSection, HowItWorksSection, ActivitySection };