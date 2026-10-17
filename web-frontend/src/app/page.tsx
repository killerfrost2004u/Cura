export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        textAlign: "center",
        background: "#ffffff",
      }}
    >
      <img
        src="/Cura Logo.svg"
        alt="CURA Logo"
        style={{ width: "180px", height: "auto", marginBottom: "24px" }}
      />
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "800",
          color: "#0F172A",
          margin: "0 0 10px 0",
          letterSpacing: "-0.5px",
        }}
      >
        CURA
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "#64748B",
          maxWidth: "480px",
          lineHeight: "1.5",
          margin: "0 0 28px 0",
        }}
      >
        Adaptive AI Assistant for Care, Focus, and Everyday Assistance.
      </p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 20px",
          background: "#F8FAFC",
          borderRadius: "9999px",
          border: "1px solid #E2E8F0",
          fontSize: "13px",
          fontWeight: "600",
          color: "#0284C7",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#10B981",
            display: "inline-block",
          }}
        />
        Web Workspace Initialized — Ready for Frontend Team
      </div>
    </main>
  );
}
