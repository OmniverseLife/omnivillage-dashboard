import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import Wrapper from "../components/wrapper/wrapper";
// Styled components using CSS-in-JS
const AppContainer = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      // backgroundColor: '#f3f4f6',
      padding: "16px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}
  >
    {children}
  </div>
);

const MainTitle = ({ children }) => (
  <h1
    style={{
      fontSize: "32px",
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: "24px",
      textAlign: "center",
    }}
  >
    {children}
  </h1>
);

const Container = ({ children }) => (
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "16px",
      backgroundColor: "white",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
    }}
  >
    {children}
  </div>
);

const Section = ({ children }) => (
  <section
    style={{
      marginBottom: "32px",
      padding: "24px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }}
  >
    {children}
  </section>
);

const SectionTitle = ({ children }) => (
  <h2
    style={{
      fontSize: "24px",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
    }}
  >
    <span
      style={{
        height: "24px",
        width: "8px",
        backgroundColor: "#7c3aed",
        marginRight: "8px",
        borderRadius: "2px",
      }}
    ></span>
    {children}
  </h2>
);

const Grid = ({ children, columns = 1 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "24px",
      "@media (max-width: 768px)": {
        gridTemplateColumns: "1fr",
      },
    }}
  >
    {children}
  </div>
);

const Card = ({ children, center = false }) => (
  <div
    style={{
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: center ? "center" : "flex-start",
      textAlign: center ? "center" : "left",
      border: "1px solid #e5e7eb",
    }}
  >
    {children}
  </div>
);

// Main App component
const App = () => {
  return (
    <Wrapper>
      <AppContainer>
        {/* <MainTitle>Community Overview Dashboard - Rukha Village</MainTitle> */}
        <Container>
          <GNHAlignedIndicators />
          <InsightsForAction />
          <WellbeingGNHIndicators />
          <CoreCapitalIndicators />
        </Container>
      </AppContainer>
    </Wrapper>
  );
};

// InsightsForAction Component
const InsightsForAction = () => {
  const insightsData = [
    {
      title: "What's Working",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "32px", width: "32px", color: "#10b981" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      content:
        "Effective water management practices, successful organic farming initiatives, and robust community health programs.",
    },
    {
      title: "What's Needed",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "32px", width: "32px", color: "#ef4444" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      content:
        "Increased energy diversification, better utilization of undeveloped land, necessary housing repairs, and formal financial access.",
    },
    {
      title: "What Can Be Shared",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "32px", width: "32px", color: "#3b82f6" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      ),
      content:
        "Successful low-energy housing models, effective solar panel adoption strategies, and integrated rainwater harvesting systems.",
    },
  ];

  return (
    <Section>
      <SectionTitle>Insights for Action</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {insightsData.map((insight, index) => (
          <Card key={index} center>
            <div style={{ marginBottom: "16px" }}>{insight.icon}</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              {insight.title}
            </h3>
            <p style={{ color: "#6b7280" }}>{insight.content}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
};

// WellbeingGNHIndicators Component
const WellbeingGNHIndicators = () => {
  const data = [
    { name: "Livelihood", score: 75, color: "#a78bfa" },
    { name: "Environment", score: 70, color: "#a78bfa" },
    { name: "Education", score: 60, color: "#a78bfa" },
    { name: "Health", score: 85, color: "#a78bfa" },
    { name: "Social Relations", score: 78, color: "#a78bfa" },
    { name: "Governance", score: 65, color: "#a78bfa" },
    { name: "Culture", score: 82, color: "#a78bfa" },
  ];

  return (
    <Section>
      <SectionTitle>Wellbeing & GNH Indicators</SectionTitle>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "500",
          color: "#374151",
          marginBottom: "16px",
        }}
      >
        Seven Spheres of Wellbeing
      </h3>
      <div style={{ height: "320px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              style={{ fontSize: "14px" }}
            />
            <YAxis
              ticks={[0, 20, 40, 60, 80, 100]}
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              style={{ fontSize: "14px" }}
            />
            <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Bar
              dataKey="score"
              barSize={50}
              radius={[0, 0, 0, 0]}
              fill="#a78bfa"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
};

const GNHAlignedIndicators = () => {
  const data = [
    { name: "PHYSICAL", score: 0.39, fullMark: 1 },
    { name: "FINANCIAL/OCCUPATIONAL", score: 0.15, fullMark: 1 },
    { name: "EMOTIONAL", score: 0.81, fullMark: 1 },
    { name: "INTELLECTUAL/MENTAL", score: 0.26, fullMark: 1 },
    { name: "SOCIAL", score: 0.51, fullMark: 1 },
    { name: "ENVIRONMENTAL", score: 0.72, fullMark: 1 },
    { name: "SPIRITUAL", score: 0.67, fullMark: 1 },
  ];

  return (
    <Section>
      <SectionTitle>GNH-Aligned Indicators (Spatial View)</SectionTitle>
      <div
        style={{
          height: "450px",
          width: "100%",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#d0d0d0" />{" "}
            {/* Changed grid line color to a lighter gray */}
            <PolarAngleAxis
              dataKey="name"
              tickFormatter={(name) => name.replace("/", "\n")} // Adjusted for new labels
              style={{ fontSize: "13px", fill: "#555" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]} // Domain adjusted for scores between 0 and 1
              tickCount={6} // Still 6 ticks for clarity (0, 0.2, 0.4, 0.6, 0.8, 1.0)
              tickFormatter={(value) => value.toFixed(1)} // Format radius axis ticks to one decimal
              style={{ fontSize: "12px", fill: "#777" }}
            />
            <Tooltip
              formatter={(value) => [`Score: ${value.toFixed(2)}`, ""]} // Format tooltip to show "Score: X.XX"
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
              labelStyle={{ fontWeight: "bold", color: "#333" }}
            />
            <Radar
              name="GNH Score"
              dataKey="score"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{fontWeight:500}}>Scores closer to 1 indicate higher wellbeing in that aspect.</div>
    </Section>
  );
};

// CoreCapitalIndicators Component
const CoreCapitalIndicators = () => {
  const capitalData = [
    {
      title: "Natural Capital",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "24px", width: "24px", color: "#059669" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v18m9-9H3"
          />
        </svg>
      ),
      assets: `Extensive forest cover, fertile agricultural lands, and well-maintained sacred groves.`,
      needs: `Addressing degraded land, managing invasive species risks.`,
      surplus: `Proven forest conservation models, rich medicinal flora knowledge.`,
    },
    {
      title: "Built Capital",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "24px", width: "24px", color: "#2563eb" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
          />
        </svg>
      ),
      assets: `A good number of houses and community halls, existing solar microgrid infrastructure.`,
      needs: `Repairing damaged bridges, addressing general roofing repairs.`,
      surplus: `Successful low-energy earth-solar housing models.`,
    },
    {
      title: "Human Capital",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "24px", width: "24px", color: "#7c3aed" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-3m-10 0H4a2 2 0 00-2 2v11a2 2 0 002 2h3m1.382-6.768a2 2 0 00-1.892-2.923l-3.324.664a2 2 0 00-1.275 3.037l1.536 2.56c.42.7.756 1.492.986 2.338.22.848.33 1.706.33 2.571 0 2.277-2.617 3.528-4.996 3.528h-.128a3.175 3.033 0 01-3.031-3.175c0-1.74.87-3.307 2.37-4.148l.498-.277"
          />
        </svg>
      ),
      assets: `High literacy rates, a network of health aides, and traditional healers.`,
      needs: `Addressing teacher shortages, expanding vocational training access, managing specific health concerns like hypertension.`,
      surplus: `Effective community healthcare and literacy methods.`,
    },
    {
      title: "Social Capital",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "24px", width: "24px", color: "#d97706" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-3m-10 0H4a2 2 0 00-2 2v11a2 2 0 002 2h3m1.382-6.768a2 2 0 00-1.892-2.923l-3.324.664a2 2 0 00-1.275 3.037l1.536 2.56c.42.7.756 1.492.986 2.338.22.848.33 1.706.33 2.571 0 2.277-2.617 3.528-4.996 3.528h-.128a3.175 3.033 0 01-3.031-3.175c0-1.74.87-3.307 2.37-4.148l.498-.277"
          />
        </svg>
      ),
      assets: `Active self-help groups, established local dispute resolution systems, and vibrant collective rituals.`,
      needs: `Increasing representation for youth and women in community leadership.`,
      surplus: `Successful timebank and cooperative group practices.`,
    },
    {
      title: "Cultural Capital",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "24px", width: "24px", color: "#dc2626" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      assets: `Two annual festivals, a sacred grove, and rich oral traditions.`,
      needs: `Preventing the erosion of traditional crafts and practices.`,
      surplus: `Vibrant living heritage festivals and traditional craft revival initiatives.`,
    },
    {
      title: "Financial Capital",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "24px", width: "24px", color: "#059669" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 11V9a2 2 0 00-2-2m0 0H5a2 2 0 00-2 2v6a2 2 0 002 2h6m-7 1h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      assets: `A significant percentage of households with bank accounts and personal savings, community lending practices.`,
      needs: `Addressing informal debt cycles, improving access to formal financial services.`,
      surplus: `Successful women's rotating credit models.`,
    },
    {
      title: "Economic Capital",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "24px", width: "24px", color: "#4f46e5" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      ),
      assets: `Key agricultural produce like citrus, cardamom, and bamboo, developing eco-tourism guides.`,
      needs: `Establishing processing facilities for local produce, improving market access.`,
      surplus: `Exemplary organic citrus and bamboo farm models.`,
    },
    {
      title: "Food Capital",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "24px", width: "24px", color: "#ea580c" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
          />
        </svg>
      ),
      assets: `Staple crops like millet and rice ensuring significant staple sufficiency, a good percentage of individuals with balanced diets.`,
      needs: `Addressing seasonal hunger and specific nutrition gaps.`,
      surplus: `Established millet seed banks and a strong food sovereignty network.`,
    },
  ];

  return (
    <Section>
      <SectionTitle>Core Capital Indicators</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {capitalData.map((capital, index) => (
          <Card key={index}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {capital.icon}
              <span style={{ marginLeft: "8px", fontWeight: 700 }}>
                {capital.title}
              </span>
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "8px" }}>
              <span style={{ fontWeight: "600", color: "#047857" }}>
                Assets:
              </span>{" "}
              {capital.assets}
            </p>
            <p style={{ color: "#6b7280", marginBottom: "8px" }}>
              <span style={{ fontWeight: "600", color: "#dc2626" }}>
                Needs:
              </span>{" "}
              {capital.needs}
            </p>
            <p style={{ color: "#6b7280" }}>
              <span style={{ fontWeight: "600", color: "#2563eb" }}>
                Surplus:
              </span>{" "}
              {capital.surplus}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default App;
