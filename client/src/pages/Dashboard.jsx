
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Products",
      number: "01",
      description:
        "Manage your product catalog, SKU details, categories, prices and available stock.",
      route: "/products",
      label: "Product catalog",
    },
    {
      title: "Suppliers",
      number: "02",
      description:
        "Organize supplier information, contact details and supplier relationships.",
      route: "/suppliers",
      label: "Supplier network",
    },
    {
      title: "Purchases",
      number: "03",
      description:
        "Record incoming purchases and keep inventory quantities updated.",
      route: "/purchases",
      label: "Stock incoming",
    },
    {
      title: "Sales",
      number: "04",
      description:
        "Manage sales transactions and track outgoing products with ease.",
      route: "/sales",
      label: "Stock outgoing",
    },
    {
      title: "Reports",
      number: "05",
      description:
        "Review revenue, sales performance and important business information.",
      route: "/reports",
      label: "Business insights",
    },
    {
      title: "Low Stock",
      number: "06",
      description:
        "Identify products that need replenishment before stock runs out.",
      route: "/low-stock",
      label: "Stock monitoring",
    },
  ];

  const workflow = [
    {
      number: "01",
      title: "Add your products",
      description:
        "Create a product catalog with names, SKU, price, category and quantity.",
    },
    {
      number: "02",
      title: "Connect suppliers",
      description:
        "Keep supplier information organized for your purchasing operations.",
    },
    {
      number: "03",
      title: "Record purchases",
      description:
        "Enter purchased quantities and update available inventory.",
    },
    {
      number: "04",
      title: "Manage sales",
      description:
        "Record sales and automatically adjust your inventory levels.",
    },
    {
      number: "05",
      title: "Monitor stock",
      description:
        "Identify low-stock products and keep inventory under control.",
    },
    {
      number: "06",
      title: "Review performance",
      description:
        "Use reports to understand sales, revenue and inventory activity.",
    },
  ];

  const features = [
    {
      title: "Centralized inventory",
      description:
        "Keep products, quantities, prices and categories organized in one place.",
    },
    {
      title: "Stock movement tracking",
      description:
        "Maintain a clear workflow for incoming purchases and outgoing sales.",
    },
    {
      title: "Supplier management",
      description:
        "Organize supplier records and simplify your purchasing process.",
    },
    {
      title: "Business reporting",
      description:
        "Understand sales, inventory and business performance through reports.",
    },
    {
      title: "Stock alerts",
      description:
        "Find products with limited quantities and plan replenishment.",
    },
    {
      title: "Role-based access",
      description:
        "Organize access for administrators, managers and staff members.",
    },
  ];

  const roles = [
    {
      title: "Administrator",
      description:
        "Manage the system, users, products, suppliers and business operations.",
    },
    {
      title: "Manager",
      description:
        "Handle daily inventory operations, purchases, sales and monitoring.",
    },
    {
      title: "Staff",
      description:
        "Perform assigned inventory and sales tasks within permitted access.",
    },
  ];

  const goToModule = (route) => {
    navigate(route);
  };

  return (
    <main className="inv-home">

      {/* HERO SECTION */}
      <section className="inv-hero">

        <div className="inv-hero-content">
          <div className="inv-eyebrow">
            INVENTORY MANAGEMENT SYSTEM
          </div>

          <h1>
            Smarter inventory.
            <br />
            <span>Better business.</span>
          </h1>

          <p className="inv-hero-description">
            A centralized workspace to manage products, suppliers,
            purchases, sales and stock operations with clarity
            and control.
          </p>

          <div className="inv-hero-actions">
            <button
              className="inv-btn-primary"
              onClick={() => goToModule("/products")}
            >
              Explore Inventory
            </button>

            <button
              className="inv-btn-secondary"
              onClick={() =>
                document
                  .getElementById("inv-workflow")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Workflow
            </button>
          </div>

          <div className="inv-hero-note">
            <span>Centralized</span>
            <span className="inv-dot"></span>
            <span>Organized</span>
            <span className="inv-dot"></span>
            <span>Efficient</span>
          </div>
        </div>

        <div className="inv-hero-visual">

          <div className="inv-visual-top">
            <div>
              <span className="inv-visual-label">
                INVENTORY WORKSPACE
              </span>
              <h3>Operations overview</h3>
            </div>
            <div className="inv-status">Workspace</div>
          </div>

          <div className="inv-visual-grid">

            <div className="inv-visual-card inv-visual-card-blue">
              <span>Product catalog</span>
              <strong>Products</strong>
              <p>Organized inventory records</p>
            </div>

            <div className="inv-visual-card inv-visual-card-white">
              <span>Stock operations</span>
              <strong>Purchases</strong>
              <p>Incoming inventory</p>
            </div>

            <div className="inv-visual-card inv-visual-card-white">
              <span>Business operations</span>
              <strong>Sales</strong>
              <p>Outgoing inventory</p>
            </div>

            <div className="inv-visual-card inv-visual-card-dark">
              <span>Business insights</span>
              <strong>Reports</strong>
              <p>Performance overview</p>
            </div>

          </div>

          <div className="inv-stock-flow">
            <div className="inv-flow-item">
              <span>01</span>
              <strong>Purchase</strong>
            </div>

            <div className="inv-flow-line"></div>

            <div className="inv-flow-item inv-flow-highlight">
              <span>02</span>
              <strong>Inventory</strong>
            </div>

            <div className="inv-flow-line"></div>

            <div className="inv-flow-item">
              <span>03</span>
              <strong>Sale</strong>
            </div>
          </div>

          <div className="inv-visual-bottom">
            <span>Inventory flow</span>
            <span>Track every movement</span>
          </div>

        </div>

      </section>

      {/* INTRO STRIP */}
      <section className="inv-intro-strip">
        <div>
          <span className="inv-strip-number">01</span>
          <h3>Organize</h3>
          <p>Bring all products and suppliers together.</p>
        </div>

        <div>
          <span className="inv-strip-number">02</span>
          <h3>Control</h3>
          <p>Monitor inventory through daily operations.</p>
        </div>

        <div>
          <span className="inv-strip-number">03</span>
          <h3>Understand</h3>
          <p>Make informed decisions using reports.</p>
        </div>
      </section>

      {/* WORKFLOW */}
      <section
        className="inv-section"
        id="inv-workflow"
      >
        <div className="inv-section-heading">
          <div>
            <span className="inv-section-label">
              HOW IT WORKS
            </span>
            <h2>
              From incoming stock
              <br />
              to business insights.
            </h2>
          </div>

          <p>
            A simple, structured workflow designed to
            make everyday inventory operations easier
            to manage.
          </p>
        </div>

        <div className="inv-workflow-grid">
          {workflow.map((item) => (
            <div className="inv-workflow-card" key={item.number}>
              <span className="inv-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section className="inv-modules-section">

        <div className="inv-section-heading">
          <div>
            <span className="inv-section-label">
              YOUR WORKSPACE
            </span>
            <h2>
              Everything in
              <br />
              one place.
            </h2>
          </div>

          <p>
            Navigate through the core modules of your
            inventory management system.
          </p>
        </div>

        <div className="inv-modules-grid">
          {modules.map((module) => (
            <div
              className="inv-module-card"
              key={module.number}
              onClick={() => goToModule(module.route)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToModule(module.route);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="inv-module-top">
                <span className="inv-module-number">
                  {module.number}
                </span>

                <span className="inv-module-label">
                  {module.label}
                </span>
              </div>

              <h3>{module.title}</h3>

              <p>{module.description}</p>

              <div className="inv-module-link">
                Open module <span>→</span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* FEATURES */}
      <section className="inv-section">

        <div className="inv-section-heading">
          <div>
            <span className="inv-section-label">
              CORE CAPABILITIES
            </span>
            <h2>
              Designed for
              <br />
              daily operations.
            </h2>
          </div>

          <p>
            Essential inventory tools that help simplify
            routine tasks and keep business operations organized.
          </p>
        </div>

        <div className="inv-feature-grid">
          {features.map((feature, index) => (
            <div className="inv-feature-card" key={feature.title}>
              <span className="inv-feature-number">
                0{index + 1}
              </span>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>

      </section>

      {/* ROLE SECTION */}
      <section className="inv-roles-section">

        <div className="inv-section-heading">
          <div>
            <span className="inv-section-label">
              ACCESS MANAGEMENT
            </span>
            <h2>
              A workspace
              <br />
              for every role.
            </h2>
          </div>

          <p>
            Role-based access helps users work with
            the information and operations relevant to
            their responsibilities.
          </p>
        </div>

        <div className="inv-roles-grid">
          {roles.map((role, index) => (
            <div className="inv-role-card" key={role.title}>
              <span className="inv-role-number">
                ROLE 0{index + 1}
              </span>

              <h3>{role.title}</h3>

              <p>{role.description}</p>
            </div>
          ))}
        </div>

      </section>

      {/* CTA SECTION */}
      <section className="inv-cta-section">

        <div className="inv-cta-content">
          <span className="inv-section-label inv-cta-label">
            YOUR INVENTORY. YOUR CONTROL.
          </span>

          <h2>
            Bring your inventory
            <br />
            operations together.
          </h2>

          <p>
            Manage your products, track stock movements
            and keep your operations organized with one
            connected workspace.
          </p>

          <button
            className="inv-btn-cta"
            onClick={() => goToModule("/products")}
          >
            Start Managing Inventory
          </button>
        </div>

        <div className="inv-cta-side">
          <span>Inventory</span>
          <div className="inv-cta-line"></div>
          <span>Operations</span>
          <div className="inv-cta-line"></div>
          <span>Management</span>
        </div>

      </section>

      {/* PROFESSIONAL FOOTER */}
      <footer className="inv-footer">

        <div className="inv-footer-main">

          <div className="inv-footer-brand">
            <div className="inv-brand-mark">
              IMS
            </div>

            <h3>Inventory Management System</h3>

            <p>
              A smarter way to organize products, track
              stock and manage everyday inventory
              operations.
            </p>
          </div>

          <div className="inv-footer-column">
            <h4>Workspace</h4>

            <button onClick={() => goToModule("/products")}>
              Products
            </button>

            <button onClick={() => goToModule("/suppliers")}>
              Suppliers
            </button>

            <button onClick={() => goToModule("/purchases")}>
              Purchases
            </button>

            <button onClick={() => goToModule("/sales")}>
              Sales
            </button>
          </div>

          <div className="inv-footer-column">
            <h4>Management</h4>

            <button onClick={() => goToModule("/reports")}>
              Reports
            </button>

            <button onClick={() => goToModule("/low-stock")}>
              Low Stock
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("inv-workflow")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Workflow
            </button>
          </div>

          <div className="inv-footer-column">
            <h4>About System</h4>

            <p>Inventory Tracking</p>
            <p>Stock Management</p>
            <p>Role-based Access</p>
            <p>Business Operations</p>
          </div>

        </div>

        <div className="inv-footer-bottom">
          <p>
            © {new Date().getFullYear()} Inventory Management System.
            All rights reserved.
          </p>

          <span>
            Built for organized inventory operations.
          </span>
        </div>

      </footer>

    </main>
  );
};

export default Dashboard;
