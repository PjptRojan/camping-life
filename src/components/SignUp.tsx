/**
 * SignUp.tsx
 * -----------------------------------------------------------------------------
 * Account creation screen for CampingLife. A two-pane layout: a brand hero on
 * the left (echoing the dashboard's emerald → amber styling) and the sign-up
 * form on the right. Form state is owned by Formik and validated with a Yup
 * schema that mirrors the backend `User` model (name, email, password).
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, type FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Tent,
  UserRound,
} from "lucide-react";
import { PasswordToggle, TextField } from "@/components/form/TextField";

/* ------------------------------------------------------------------ */
/* Types & validation                                                  */
/* ------------------------------------------------------------------ */

/** Shape of the sign-up form. `confirmPassword` is client-only (not persisted). */
interface SignUpValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_VALUES: SignUpValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

/**
 * Yup schema mirroring the backend `User` model. `name`, `email` and
 * `password` map to columns; `confirmPassword` guards against typos before we
 * hash and store the password server-side.
 */
const SignUpSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must be 60 characters or fewer.")
    .required("Please enter your name."),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters.")
    .matches(/[A-Za-z]/, "Include at least one letter.")
    .matches(/[0-9]/, "Include at least one number.")
    .required("Password is required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match.")
    .required("Please confirm your password."),
});

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface SignUpProps {
  /**
   * Called with the validated values (minus `confirmPassword`) when the form is
   * submitted. Wire this to your auth API. Defaults to a console log so the
   * screen is usable standalone.
   */
  onSubmit?: (values: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
}

/** Full-screen account creation page styled to match the CampingLife theme. */
export function SignUp({ onSubmit }: SignUpProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (
    values: SignUpValues,
    helpers: FormikHelpers<SignUpValues>,
  ): Promise<void> => {
    const { confirmPassword: _confirm, ...payload } = values;
    helpers.setStatus(undefined);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Standalone fallback — replace by passing an `onSubmit` prop.
        console.log("Sign up:", payload);
      }
    } catch (err) {
      // Surface server-side failures (e.g. duplicate email) as a form banner.
      helpers.setStatus(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 lg:grid lg:grid-cols-2">
      {/* ---------- Brand / hero pane ---------- */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Soft decorative glow */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm backdrop-blur">
            <Tent className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-extrabold tracking-tight">CamperLife</p>
            <p className="-mt-0.5 text-[11px] font-medium uppercase tracking-wider text-amber-300">
              Premium Outdoors
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
            Camping, curated
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight">
            Your next escape starts with an account.
          </h2>
          <p className="mt-3 text-emerald-100">
            Join CamperLife to design trips, book hand-picked sites and unlock
            members-only gear and luxury services.
          </p>
        </div>

        <p className="relative text-sm text-emerald-200/80">
          Hand-picked sites across mountains, lakes and forests.
        </p>
      </aside>

      {/* ---------- Form pane ---------- */}
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:min-h-0">
        <div className="w-full max-w-md animate-fade-in">
          {/* Compact brand for small screens */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <Tent className="h-5 w-5" />
            </span>
            <p className="text-lg font-extrabold tracking-tight text-emerald-900">
              CamperLife
            </p>
          </div>

          <header className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-emerald-900">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              It only takes a minute to start planning your perfect trip.
            </p>
          </header>

          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={SignUpSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form noValidate className="space-y-4">
                {typeof status === "string" && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{status}</span>
                  </div>
                )}

                <TextField
                  name="name"
                  label="Full name"
                  type="text"
                  placeholder="Jordan Vale"
                  autoComplete="name"
                  icon={<UserRound className="h-4 w-4" />}
                />

                <TextField
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  icon={<Mail className="h-4 w-4" />}
                />

                <TextField
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  icon={<Lock className="h-4 w-4" />}
                  trailing={
                    <PasswordToggle
                      shown={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                  }
                />

                <TextField
                  name="confirmPassword"
                  label="Confirm password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  icon={<Lock className="h-4 w-4" />}
                  trailing={
                    <PasswordToggle
                      shown={showConfirm}
                      onToggle={() => setShowConfirm((v) => !v)}
                    />
                  }
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Creating account…" : "Create account"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
