# Hatchery Compliance — Ghana Regulatory Roadmap

> **Status (MVP)**: Permit documents are uploaded by operators during
> onboarding and reviewed **manually** by Farmlink admins. Automated registry
> verification is **out of scope** for v1 and documented here as the path
> forward.

---

## 1. Regulatory landscape

Hatcheries operating in Ghana typically need authorisations from one or more
of the following bodies depending on category:

| Authority | Code in DB | Applies to |
|-----------|-----------|------------|
| Veterinary Services Directorate (Ministry of Food & Agriculture) | `vsd` | Poultry hatcheries, breeding stock, vaccination compliance |
| Fisheries Commission | `fisheries_commission` | Fish hatcheries, aquaculture (tilapia, catfish fingerlings) |
| Environmental Protection Agency | `epa` | Effluent / waste handling (medium & large operations) |
| District Assembly | `district_assembly` | Local business operating permit |

Operators may also need:

- **Animal Health Certificates** for inter-regional stock movement
- **Vaccination certificates** (Marek's, Newcastle, Gumboro for poultry)
- **NPIP-style** flock health certification (aspirational — not currently
  enforced in Ghana but relevant for export markets)

---

## 2. Required documents per category

| Category | Minimum permit | Recommended extras |
|----------|---------------|---------------------|
| **Poultry chicks** | VSD hatchery permit + district business permit | Vaccination logs, biosecurity SOP |
| **Fish fingerlings** | Fisheries Commission aquaculture licence | EPA registration if pond > 1 ha |
| **Breeding stock** | VSD breeder registration + district permit | Pedigree records, herd health docs |

---

## 3. Data we already capture today

The schema captures everything needed for future automated verification:

```text
hatcheries
  ├── permit_number       text
  ├── permit_authority    enum (vsd | fisheries_commission | epa | district_assembly | other)
  └── permit_doc_path     text (private storage: hatchery-permits bucket)
```

The permit document is stored in the **private** `hatchery-permits` bucket;
admins access it via short-lived signed URLs. The owner can re-upload, but
the file is never publicly viewable.

---

## 4. Roadmap (not in MVP scope)

1. **Automated registry checks** — call into VSD / Fisheries Commission
   public registries (when an API or open dataset becomes available) using
   `permit_number` + `permit_authority` to verify the hatchery's permit is
   on file before approval, and re-verify on a quarterly cron.
2. **Permit expiry tracking** — add `permit_expires_on date` and surface a
   30-day reminder in the operator dashboard + email/SMS to the operator.
3. **Per-batch vaccination certificates** — extend `hatchery_batch_events`
   with a `certificate_path` for each vaccination event so buyers can
   download proof on the public batch page.
4. **Biosecurity audits** — annual admin-led audit workflow that flips
   `hatcheries.audited_at` and unlocks a "Biosecurity audited" badge.
5. **Cold-chain / hatch logging** — IoT-friendly endpoint to ingest
   incubator temperature and humidity logs per batch.

---

## 5. Why we ship this manually first

- Most Ghanaian regulatory bodies don't yet expose programmatic endpoints
  for permit verification.
- Manual review by a Farmlink admin (with signed-URL access to the uploaded
  document) is the highest-fidelity check we can offer day one.
- The schema is forward-compatible: when an automated path appears, we can
  cut over without a data migration.
