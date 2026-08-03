/**
 * PAGE EXECUTION FLOW: Signup
 * ---------------------------------------------------------
 * 1. User fills out the registration form.
 * 2. `handleSubmit` sends the data to `signup` in AuthContext.
 * 3. If the backend creates the user successfully, we redirect the user 
 *    to the Login page to authenticate with their new credentials.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IconLock, IconMail, IconEye, IconEyeOff, IconShieldLock, IconUserCircle } from "@tabler/icons-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    setIsLoading(true);
    const success = await signup(email.split('@')[0], email, password, role);
    setIsLoading(false);
    if (success) {
      navigate("/login", { replace: true });
    } else {
      setError("Registration failed. Please try a different email.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#111111]">
      {/* Left Side - Branding */}
      <div className="hidden w-1/2 flex-col justify-between p-12 lg:flex relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#f59e0b] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#f59e0b] blur-[120px]" />
        </div>
        
        <Link to="/" className="relative z-10 flex items-center gap-3 md:gap-4 hover:opacity-90 transition-opacity">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1a1a] shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-[#2a2a2a]">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
              <path d="M12 11a1 1 0 1 0 0 -2a1 1 0 0 0 0 2z" />
              <path d="M12 11v2.5" />
            </svg>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold tracking-tight text-[#f59e0b]">
              Auct<span className="text-white">XI</span>
            </span>
            <div className="hidden sm:block h-8 w-[2px] bg-[#333333]"></div>
            <span className="hidden sm:block text-sm font-bold tracking-[0.25em] text-[#6b7280]">
              BID. BUILD. WIN.
            </span>
          </div>
        </Link>
        <div className="relative z-10 mb-20 max-w-lg">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Join the <span className="text-[#f59e0b]">Elite Network</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400">
            Create your account today and gain access to the most powerful real-time sports auction platform on the market.
          </p>
        </div>
        <div className="relative z-10 text-sm text-gray-500 font-medium tracking-wider">
          © {new Date().getFullYear()} AUCTXI INC. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex w-full items-center justify-center bg-white lg:w-1/2 rounded-l-none lg:rounded-l-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-20 relative overflow-y-auto">
        <div className="w-full max-w-md px-8 py-12 sm:px-12 my-auto">
          
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <IconShieldLock className="h-8 w-8 text-[#f59e0b]" />
              <span className="text-2xl font-bold tracking-tight text-[#111111]">AuctXI</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
            <p className="mt-2 text-sm text-gray-500">Enter your details to get started with AuctXI.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100 flex items-start">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} stroke={1.5} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-4 focus:ring-[#f59e0b]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} stroke={1.5} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-4 focus:ring-[#f59e0b]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <IconEyeOff size={18} stroke={1.5} /> : <IconEye size={18} stroke={1.5} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Role</label>
              <div className="relative">
                <IconUserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} stroke={1.5} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-10 text-sm font-medium text-gray-700 transition-all focus:border-[#f59e0b] focus:outline-none focus:ring-4 focus:ring-[#f59e0b]/10"
                >
                  <option value="admin">System Admin</option>
                  <option value="manager">Auction Manager</option>
                  <option value="client">Client / Bidder</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-xl bg-[#111111] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#222222] focus:outline-none focus:ring-4 focus:ring-gray-200 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white border-t-transparent"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="font-semibold text-[#111111] hover:text-[#f59e0b] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;