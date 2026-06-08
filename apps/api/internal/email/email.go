package email

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"
)

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	From     string
}

type Service struct {
	cfg Config
}

func NewService(cfg Config) *Service {
	return &Service{cfg: cfg}
}

func (s *Service) configured() bool {
	return s.cfg.Host != "" && s.cfg.User != ""
}

func (s *Service) send(to, subject, htmlBody string) error {
	if !s.configured() {
		log.Printf("[email] SMTP not configured — skipping email to %s: %s", to, subject)
		return nil
	}

	auth := smtp.PlainAuth("", s.cfg.User, s.cfg.Password, s.cfg.Host)
	msg := strings.Join([]string{
		"From: " + s.cfg.From,
		"To: " + to,
		"Subject: " + subject,
		"MIME-Version: 1.0",
		"Content-Type: text/html; charset=UTF-8",
		"",
		htmlBody,
	}, "\r\n")

	return smtp.SendMail(s.cfg.Host+":"+s.cfg.Port, auth, s.cfg.From, []string{to}, []byte(msg))
}

func (s *Service) SendLoginNotification(to string) {
	subject := "New sign-in to your Fitcount account"
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#333">
  <div style="text-align:center;margin-bottom:24px">
    <span style="display:inline-block;width:52px;height:52px;line-height:52px;border-radius:50%%;background:#16a34a;color:#fff;font-size:22px;font-weight:700;text-align:center">F</span>
  </div>
  <h2 style="color:#16a34a;text-align:center;margin-top:0">New Sign-In Detected</h2>
  <p>Hi there,</p>
  <p>We noticed a successful sign-in to your Fitcount account (<strong>%s</strong>).</p>
  <p>If this was you, great — keep crushing your wellness goals! 💪</p>
  <p>If you didn't sign in, please reset your password immediately.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:28px 0">
  <p style="font-size:12px;color:#aaa;text-align:center">Fitcount — Personalised Wellness</p>
</body>
</html>`, to)

	if err := s.send(to, subject, body); err != nil {
		log.Printf("[email] failed to send login notification to %s: %v", to, err)
	}
}

func (s *Service) SendPasswordReset(to, resetLink string) {
	subject := "Reset your Fitcount password"
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#333">
  <div style="text-align:center;margin-bottom:24px">
    <span style="display:inline-block;width:52px;height:52px;line-height:52px;border-radius:50%%;background:#16a34a;color:#fff;font-size:22px;font-weight:700;text-align:center">F</span>
  </div>
  <h2 style="color:#16a34a;text-align:center;margin-top:0">Password Reset</h2>
  <p>Hi there,</p>
  <p>We received a request to reset your Fitcount password. Click the button below to choose a new one:</p>
  <div style="text-align:center;margin:32px 0">
    <a href="%s" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Reset Password</a>
  </div>
  <p style="font-size:13px;color:#666">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:28px 0">
  <p style="font-size:12px;color:#aaa;text-align:center">Fitcount — Personalised Wellness</p>
</body>
</html>`, resetLink)

	if err := s.send(to, subject, body); err != nil {
		log.Printf("[email] failed to send password reset to %s: %v", to, err)
	}
}
