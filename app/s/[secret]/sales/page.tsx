import Link from "next/link";
import { notFound } from "next/navigation";
import { pathAuthorized } from "@/lib/auth";
import {
  GumroadError,
  gumroadSellerEnabled,
  listSales,
  verifyLicense,
  type Sale,
  type VerifyResult,
} from "@/lib/gumroad";
import { disableLicenseAction, enableLicenseAction } from "./actions";

export const dynamic = "force-dynamic";

const brand = process.env.BRAND_NAME || "FreshGen";

// Verifying is a live Gumroad call per key — cap it so a big sales history
// doesn't turn a page load into 200 sequential-ish network calls.
const MAX_VERIFY = 50;

function maskKey(key: string): string {
  if (!key) return "—";
  return key.length <= 8 ? key : `${key.slice(0, 8)}…`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

type Tone = "ok" | "bad" | "off";

// Refunded/chargebacked/disputed come straight from the sale record and win
// regardless of verify. "Disabled" only comes from verifyLicense. Everything
// else checked is "Active"; anything outside the MAX_VERIFY window is "—".
function statusFor(sale: Sale, checked: boolean, verify: VerifyResult | null): { label: string; tone: Tone } {
  if (sale.refunded) return { label: "Refunded", tone: "bad" };
  if (sale.chargebacked) return { label: "Chargeback", tone: "bad" };
  if (sale.disputed) return { label: "Disputed", tone: "bad" };
  if (!checked) return { label: "—", tone: "off" };
  if (verify?.disabled) return { label: "Disabled", tone: "bad" };
  return { label: "Active", tone: "ok" };
}

export default async function SalesPage({
  params,
  searchParams,
}: {
  params: Promise<{ secret: string }>;
  searchParams: Promise<{ msg?: string; ok?: string }>;
}) {
  const { secret } = await params;
  if (!pathAuthorized(secret) || !gumroadSellerEnabled()) notFound();

  const { msg, ok } = await searchParams;
  const feedback = msg ? { text: msg, ok: ok === "1" } : null;

  let sales: Sale[] = [];
  let loadError = "";
  try {
    sales = await listSales();
  } catch (err) {
    loadError =
      err instanceof GumroadError && err.status === 401
        ? "Gumroad rejected the access token — check GUMROAD_ACCESS_TOKEN"
        : (err as Error).message || "Could not reach Gumroad.";
  }

  // Gumroad returns sales newest-first, but don't assume — sort defensively.
  const sorted = [...sales].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const toVerify = sorted.slice(0, MAX_VERIFY);
  const verifyResults = await Promise.all(
    toVerify.map((sale) => (sale.licenseKey ? verifyLicense(sale.licenseKey) : Promise.resolve(null)))
  );
  const verifiedById = new Map<string, VerifyResult | null>();
  toVerify.forEach((sale, i) => verifiedById.set(sale.id, verifyResults[i]));

  const totalSales = sorted.length;
  const revenueCents = sorted.reduce((sum, s) => sum + s.priceCents, 0);
  const badCount = sorted.filter((s) => s.refunded || s.chargebacked).length;
  const activeCount = toVerify.filter(
    (s) => statusFor(s, true, verifiedById.get(s.id) ?? null).label === "Active"
  ).length;

  return (
    <div className="container">
      <header className="masthead">
        <div className="wordmark">
          {brand} <em>Sales</em>
        </div>
        <div className="masthead-note">Gumroad · seller only</div>
      </header>

      <p style={{ padding: "14px 0 0", fontSize: 13 }}>
        <Link href={`/s/${secret}`} style={{ color: "var(--muted)" }}>
          &larr; Back to dashboard
        </Link>
      </p>

      {feedback && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="card">
            <p className={feedback.ok ? "caption" : "error-text"}>{feedback.text}</p>
          </div>
        </section>
      )}

      {loadError ? (
        <section className="section">
          <div className="card" style={{ borderColor: "#b42318" }}>
            <p className="error-text">{loadError}</p>
          </div>
        </section>
      ) : sorted.length === 0 ? (
        <section className="section">
          <div className="card">
            <p>No sales yet.</p>
          </div>
        </section>
      ) : (
        <>
          <section className="section">
            <div className="kicker">Overview</div>
            <div className="sales-tiles">
              <div className="card">
                <div className="stat">{totalSales}</div>
                <div className="stat-sub">Total sales</div>
              </div>
              <div className="card">
                <div className="stat">${(revenueCents / 100).toFixed(2)}</div>
                <div className="stat-sub">Revenue</div>
              </div>
              <div className="card">
                <div className="stat">{badCount}</div>
                <div className="stat-sub">Refunds / chargebacks</div>
              </div>
              <div className="card">
                <div className="stat">{activeCount}</div>
                <div className="stat-sub">Active keys (of {toVerify.length} checked)</div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="kicker">Sales</div>
            <div className="card sales-table-card">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Email</th>
                    <th>Paid</th>
                    <th>License key</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((sale) => {
                    const checked = verifiedById.has(sale.id);
                    const status = statusFor(sale, checked, verifiedById.get(sale.id) ?? null);
                    return (
                      <tr key={sale.id}>
                        <td>{formatDate(sale.createdAt)}</td>
                        <td>{sale.email || "—"}</td>
                        <td className="price">{sale.priceDisplay}</td>
                        <td>
                          <code title={sale.licenseKey || undefined}>{maskKey(sale.licenseKey)}</code>
                        </td>
                        <td>
                          <span className="status">
                            <span className={`dot ${status.tone}`} />
                            {status.label}
                          </span>
                        </td>
                        <td>
                          {sale.licenseKey ? (
                            <div className="row-actions">
                              <form action={disableLicenseAction}>
                                <input type="hidden" name="secret" value={secret} />
                                <input type="hidden" name="licenseKey" value={sale.licenseKey} />
                                <button className="btn ghost" type="submit">
                                  Disable
                                </button>
                              </form>
                              <form action={enableLicenseAction}>
                                <input type="hidden" name="secret" value={secret} />
                                <input type="hidden" name="licenseKey" value={sale.licenseKey} />
                                <button className="btn ghost" type="submit">
                                  Enable
                                </button>
                              </form>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <span>{brand} Sales</span>
        <span>
          <Link href={`/s/${secret}`}>Dashboard</Link>
        </span>
      </footer>

      <style>{`
        .sales-tiles {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .sales-tiles .card {
          padding: 20px 22px;
        }
        .sales-table-card {
          padding: 0;
          overflow-x: auto;
        }
        .sales-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          white-space: nowrap;
        }
        .sales-table th {
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          border-bottom: 2px solid var(--ink);
          padding: 12px 16px;
        }
        .sales-table td {
          border-bottom: 1px solid var(--rule);
          padding: 11px 16px;
          vertical-align: middle;
        }
        .sales-table tr:last-child td {
          border-bottom: none;
        }
        .sales-table .price {
          font-variant-numeric: tabular-nums;
        }
        .sales-table .status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .row-actions {
          display: flex;
          gap: 6px;
        }
        .row-actions form {
          display: inline;
        }
        .row-actions button {
          padding: 6px 12px;
          font-size: 12.5px;
        }
        @media (max-width: 680px) {
          .sales-tiles {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
