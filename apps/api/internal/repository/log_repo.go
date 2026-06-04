package repository

import (
	"context"
	"fitcount/api/internal/model"
	"time"

	"github.com/jmoiron/sqlx"
)

type LogRepo struct {
	db *sqlx.DB
}

func NewLogRepo(db *sqlx.DB) *LogRepo {
	return &LogRepo{db: db}
}

func (r *LogRepo) Upsert(ctx context.Context, userID, date string, req model.UpsertLogRequest) (*model.DailyLog, error) {
	setParts := []string{}
	args := []interface{}{userID, date}
	i := 3

	if req.WaterML != nil {
		setParts = append(setParts, "water_ml = $"+intToStr(i))
		args = append(args, *req.WaterML)
		i++
	}
	if req.SleepHours != nil {
		setParts = append(setParts, "sleep_hours = $"+intToStr(i))
		args = append(args, *req.SleepHours)
		i++
	}
	if req.WeightKg != nil {
		setParts = append(setParts, "weight_kg = $"+intToStr(i))
		args = append(args, *req.WeightKg)
		i++
	}

	updateClause := ""
	if len(setParts) > 0 {
		updateClause = "DO UPDATE SET " + joinStrings(setParts) + ", updated_at = now()"
	} else {
		updateClause = "DO NOTHING"
	}

	query := `INSERT INTO daily_logs (user_id, log_date) VALUES ($1, $2::date)
	          ON CONFLICT (user_id, log_date) ` + updateClause + `
	          RETURNING *`

	var log model.DailyLog
	err := r.db.QueryRowxContext(ctx, query, args...).StructScan(&log)
	if err != nil {
		return nil, err
	}
	return &log, nil
}

func (r *LogRepo) GetByDate(ctx context.Context, userID, date string) (*model.DailyLog, error) {
	var log model.DailyLog
	err := r.db.QueryRowxContext(ctx,
		`SELECT * FROM daily_logs WHERE user_id = $1 AND log_date = $2::date`,
		userID, date,
	).StructScan(&log)
	if err != nil {
		return nil, err
	}
	return &log, nil
}

func (r *LogRepo) ListRange(ctx context.Context, userID, from, to string) ([]model.DailyLog, error) {
	var logs []model.DailyLog
	err := r.db.SelectContext(ctx, &logs,
		`SELECT * FROM daily_logs WHERE user_id = $1 AND log_date BETWEEN $2::date AND $3::date
		 ORDER BY log_date DESC`,
		userID, from, to,
	)
	return logs, err
}

func (r *LogRepo) WaterStreakDays(ctx context.Context, userID string) (int, error) {
	// Count consecutive days ending today where water_ml >= 2000
	rows, err := r.db.QueryxContext(ctx,
		`SELECT log_date, water_ml FROM daily_logs
		 WHERE user_id = $1 AND log_date <= CURRENT_DATE
		 ORDER BY log_date DESC LIMIT 60`,
		userID,
	)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	streak := 0
	expected := time.Now().Truncate(24 * time.Hour)
	for rows.Next() {
		var d time.Time
		var waterML int
		if err := rows.Scan(&d, &waterML); err != nil {
			break
		}
		if d.Truncate(24*time.Hour) != expected {
			break
		}
		if waterML < 2000 {
			break
		}
		streak++
		expected = expected.AddDate(0, 0, -1)
	}
	return streak, nil
}

func (r *LogRepo) TotalWaterLitres(ctx context.Context, userID string) (float64, error) {
	var total float64
	err := r.db.QueryRowxContext(ctx,
		`SELECT COALESCE(SUM(water_ml), 0) / 1000.0 FROM daily_logs WHERE user_id = $1`,
		userID,
	).Scan(&total)
	return total, err
}

func (r *LogRepo) LogStreakDays(ctx context.Context, userID string) (int, error) {
	rows, err := r.db.QueryxContext(ctx,
		`SELECT log_date FROM daily_logs WHERE user_id = $1
		 AND (water_ml > 0 OR sleep_hours IS NOT NULL OR weight_kg IS NOT NULL)
		 ORDER BY log_date DESC LIMIT 60`,
		userID,
	)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	streak := 0
	expected := time.Now().Truncate(24 * time.Hour)
	for rows.Next() {
		var d time.Time
		if err := rows.Scan(&d); err != nil {
			break
		}
		if d.Truncate(24*time.Hour) != expected {
			break
		}
		streak++
		expected = expected.AddDate(0, 0, -1)
	}
	return streak, nil
}
