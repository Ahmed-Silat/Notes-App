import { Card, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { singnUp } from "../../Service/AuthService";
import FormInput from "../../components/Input/FormInput";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";

const Signup = () => {
  const navigate = useNavigate();

  const validation = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Full Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const res = await singnUp(values.name, values.email, values.password);
        console.log("Signup response:", res);

        if (res.success === false) {
          toast.error(res.message);
          return;
        }

        toast.success(res.data.message);
        resetForm();
        navigate("/login");
      } catch (error) {
        // console.error("Signup error:", error.response.data.message);
        toast.error(error.response.data.message || "Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#17313E] to-[#415E72] px-4">
      <Card className="w-full max-w-lg rounded-2xl shadow-2xl p-8 sm:p-10 bg-white">
        <h2 className="text-3xl font-bold text-center text-[#2B85FF] mb-2">
          Create an Account
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Join us and get started 🚀
        </p>

        <form onSubmit={validation.handleSubmit} className="space-y-4">
          <FormInput
            name="name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={validation.values.name}
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            error={validation.errors.name}
            touched={validation.touched.name}
            icon={<UserOutlined />}
          />

          <FormInput
            name="email"
            label="Email"
            type="text"
            placeholder="example@email.com"
            value={validation.values.email}
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            error={validation.errors.email}
            touched={validation.touched.email}
            icon={<MailOutlined />}
          />

          <FormInput
            name="password"
            label="Password"
            type="password"
            placeholder="Enter password"
            value={validation.values.password}
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            error={validation.errors.password}
            touched={validation.touched.password}
            icon={<LockOutlined />}
          />

          <FormInput
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={validation.values.confirmPassword}
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            error={validation.errors.confirmPassword}
            touched={validation.touched.confirmPassword}
            icon={<LockOutlined />}
          />

          <Button
            type="primary"
            htmlType="submit"
            loading={validation.isSubmitting}
            className="w-full mt-4 bg-[#2B85FF] hover:!bg-[#1E66CC] rounded-md py-2 text-lg"
          >
            Sign Up
          </Button>

          <p className="text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2B85FF] underline font-medium">
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
