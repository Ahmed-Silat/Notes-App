import { useState } from "react";
import PasswordInput from "../../components/Input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
// import axios from "axios";
import { toast } from "react-toastify";
import { singnUp } from "../../Service/AuthService";
// import { useDispatch } from "react-redux";
// import { signInStart, signInSuccess } from "../../redux/user/userSlice";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!name) {
      setError("Please Enter Your Name");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please Enter a Valid Email Address");
      return;
    }

    if (!password) {
      setError("Please Enter The Password");
      return;
    }

    setError("");

    // sign up api

    try {
      // dispatch(signInStart);
      // const res = await axios.post(
      //   "http://localhost:3000/api/auth/signup",
      //   { username: name, email, password },
      //   { withCredentials: true }
      // );

      const res = await singnUp(name, email, password);

      if (res.data.success === false) {
        setEmail(res.data.message);
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);

      setError("");

      navigate("/login");
      // dispatch(signInSuccess(res.data));
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
      setError(error.message);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          <form onSubmit={handleSignUp}>
            <h2 className="text-3xl font-bold text-center text-[#2B85FF] mb-8">
              Create Account 📝
            </h2>

            <input
              type="text"
              placeholder="Full Name"
              className="input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button type="submit" className="btn-primary">
              Sign Up
            </button>

            <p className="text-sm text-center mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#2B85FF] underline font-medium"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
