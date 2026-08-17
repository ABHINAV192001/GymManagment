# Authentication feature

Keep authentication-specific code in this folder. It owns API calls, session types, hooks, and UI components used only by authentication screens.

```
auth/
  api/          # login, refresh, logout, password-reset requests
  components/   # LoginForm, PasswordField, AuthLayout
  hooks/        # useAuth and related hooks
  types/        # auth request/response and session types
```

Do not put dashboard-specific components or page-level route components here.
