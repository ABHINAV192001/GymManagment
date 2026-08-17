# Migration notes

`V1__baseline_schema.sql` is an empty stub - the schema has actually been built entirely by
Hibernate's `ddl-auto=update` over time, with Flyway only tracking a baseline version number
(`spring.flyway.baseline-on-migrate=true`), not real DDL.

`spring.jpa.hibernate.ddl-auto` is intentionally still `update` (not `validate`) in
`application.properties` for this reason: flipping to `validate` before the baseline reflects
the real schema will make every entity/column mismatch a startup failure.

## Safe path to `ddl-auto=validate`

1. Dump the live schema: `pg_dump -U postgres -s gymmanagment > V1__baseline_schema.sql`
   (replace the stub content, keep the filename/version so Flyway's history isn't disturbed).
2. Boot each service once against that dump with `ddl-auto=validate` in a non-prod environment
   and fix any mismatches Hibernate reports (missing columns/indexes, type differences).
3. Only then flip `ddl-auto` to `validate` (GymUserManagement) / `none` (GymWorkoutService,
   GymCommonServices) in the real `application.properties` files.

`V2__security_hardening.sql` (revoked_tokens table, lockout columns) was written to be
additive/idempotent (`IF NOT EXISTS` throughout) so it's safe to apply regardless of which
mode `ddl-auto` is in.
