# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This is the exercise-files repository for the LinkedIn Learning course "SQL for Data Analysis" (instructor Nikiya Simpson). It is not an application — it's a collection of standalone `.sql` scripts and Jupyter notebooks organized by chapter, all operating against a single sample database called **H+ Sport** (`hplussport`).

**This repo does not accept pull requests** (see `CONTRIBUTING.md`) — all PRs are automatically closed. Treat contribution-style changes accordingly.

## Environment setup

The repo is designed to run inside the provided dev container (`.devcontainer/`), which provisions two services via `docker-compose.yml`:
- `app`: Python 3 (bullseye) container with `mariadb-client` and the packages in `requirements.txt` installed (`postCreateCommand` runs `.devcontainer/startup.sh`).
- `db`: a `mariadb:latest` container, database `hplussport`, user/password `mariadb`/`mariadb` (root password `mariadb`).

On container creation, `.devcontainer/startup.sh` loads two SQL dumps into MariaDB in order:
1. `.devcontainer/setup-mariadb.sql` — grants the `mariadb` user full privileges.
2. `.devcontainer/H_Plus_Sports_MySQL.sql` — creates the `hplussport` database and its 5 tables (`Customer`, `OrderItem`, `Orders`, `Product`, `Salesperson`) with seed data.

If working outside the dev container, you need a local/remote MariaDB or MySQL instance and must load these two SQL files yourself before running any chapter script against `hplussport`.

VS Code's SQLTools extension is pre-configured in `.vscode/settings.json` to connect to `127.0.0.1:3306` as `mariadb`/`mariadb` against the `hplussport` database — use the same connection details when running scripts manually (e.g. via `mysql -h 127.0.0.1 -umariadb -pmariadb hplussport < path/to/script.sql`).

## Running the exercise files

There is no build, lint, or test tooling — the "workflow" is simply executing SQL files against `hplussport` and running notebooks:

- **SQL scripts**: run individually against the `hplussport` database, e.g. `mysql -h 127.0.0.1 -umariadb -pmariadb hplussport < "Chapter 2/Finding Duplicate Rows/Duplicate1.sql"`, or via the SQLTools extension / any MySQL client.
- **Chapter 5 (Python/Jupyter)**: requires `pip install -r requirements.txt` (mysql-connector-python, sqlalchemy, pandas, plotly, pymysql, dash). Before opening the notebooks, run `Chapter 5/Create View V_Orders.sql` against `hplussport` to create the `V_Orders` view the dashboard depends on.
  - `Chapter 5/Dashboard.ipynb` connects via `sqlalchemy` (`mysql+pymysql://mariadb:mariadb@localhost/hplussport`), queries `V_Orders`, and builds Plotly charts plus a Dash web app.
  - The Dash app serves on port 8080/8050 — view it through the VS Code "Ports" tab ("Open in Browser"). **Restart the Jupyter kernel to stop the Dash server** before re-running, otherwise the port stays bound.
  - Select the "Python 3.11.4" interpreter (or equivalent) as the notebook kernel when prompted.

## Structure and conventions

Content is organized by chapter, mirroring the course video sequence; each chapter folder contains topic subfolders holding the relevant `.sql` (or `.ipynb`) files for that lesson:

- **Chapter 1** — basic `SELECT` queries; `HPlusSportERD.pdf` is the entity-relationship diagram for the whole schema (open with a PDF viewer).
- **Chapter 2** — data quality queries: finding duplicate rows, inaccurate values, and missing values; intro to data types.
- **Chapter 3** — filtering and working with dates.
- **Chapter 4** — aggregate functions, string functions, and DML (`INSERT`/`UPDATE`/`DELETE`/`Confirm`).
- **Chapter 5** — Python/Jupyter: builds a `V_Orders` view, then a Plotly/Dash sales dashboard on top of it.

The `hplussport` schema (see `.devcontainer/H_Plus_Sports_MySQL.sql`) has 5 tables: `Customer`, `Salesperson`, `Product`, `Orders`, `OrderItem`. `Orders` references `Salesperson`; `OrderItem` links `Orders` and `Product`. Consult `Chapter 1/HPlusSportERD.pdf` for the full relationships before writing new queries.

When adding or editing exercise files, match the existing pattern: one focused `.sql` file per query/concept, placed under the chapter/topic folder it belongs to, using the same table/column casing as the schema (e.g. `CustomerID`, `TotalDue`).
