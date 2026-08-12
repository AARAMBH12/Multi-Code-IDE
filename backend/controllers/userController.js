const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secret = "secret";

function getStartupCode(language) {
  if (!language) {
    return "Language not supported";
  }

  language = language.toLowerCase();

  if (language === "python") {
    return 'print("Hello World")';
  }

  if (language === "java") {
    return 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }';
  }

  if (language === "javascript") {
    return 'console.log("Hello World");';
  }

  if (language === "cpp") {
    return '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
  }

  if (language === "c") {
    return '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
  }

  if (language === "go") {
    return 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}';
  }

  if (language === "bash") {
    return 'echo "Hello World"';
  }

  return "Language not supported";
}


// ================= SIGN UP =================

exports.signUp = async (req, res) => {
  try {
    const { email, pwd, fullName } = req.body;

    if (!email || !pwd || !fullName) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required"
      });
    }

    const emailCon = await userModel.findOne({ email });

    if (emailCon) {
      return res.status(400).json({
        success: false,
        msg: "Email already exists"
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(pwd, salt);

    await userModel.create({
      email,
      password: hash,
      fullName
    });

    return res.status(200).json({
      success: true,
      msg: "User created successfully"
    });

  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Email already exists"
      });
    }

    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};


// ================= LOGIN =================

exports.login = async (req, res) => {
  try {
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required"
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    const result = await bcrypt.compare(pwd, user.password);

    if (!result) {
      return res.status(401).json({
        success: false,
        msg: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      secret
    );

    return res.status(200).json({
      success: true,
      msg: "User logged in successfully",
      token,
      fullName: user.fullName
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};


// ================= CREATE PROJECT =================

exports.createProj = async (req, res) => {
  try {
    const { name, projLanguage, token, version } = req.body;

    if (!name || !projLanguage || !token) {
      return res.status(400).json({
        success: false,
        msg: "Required fields are missing"
      });
    }

    const decoded = jwt.verify(token, secret);

    const user = await userModel.findOne({
      _id: decoded.userId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    const project = await projectModel.create({
      name,
      projLanguage,
      createdBy: user._id,
      code: getStartupCode(projLanguage),
      version
    });

    return res.status(200).json({
      success: true,
      msg: "Project created successfully",
      projectId: project._id
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};


// ================= SAVE PROJECT =================

exports.saveProject = async (req, res) => {
  try {
    const { token, projectId, code } = req.body;

    if (!token || !projectId) {
      return res.status(400).json({
        success: false,
        msg: "Token and project ID are required"
      });
    }

    const decoded = jwt.verify(token, secret);

    const user = await userModel.findOne({
      _id: decoded.userId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    const project = await projectModel.findOneAndUpdate(
      {
        _id: projectId,
        createdBy: user._id
      },
      {
        code: code
      },
      {
        new: true
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        msg: "Project not found or access denied"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Project saved successfully"
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};


// ================= GET ALL PROJECTS =================

exports.getProjects = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Token is required"
      });
    }

    const decoded = jwt.verify(token, secret);

    const user = await userModel.findOne({
      _id: decoded.userId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    const projects = await projectModel.find({
      createdBy: user._id
    });

    return res.status(200).json({
      success: true,
      msg: "Projects fetched successfully",
      projects
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};


// ================= GET SINGLE PROJECT =================

exports.getProject = async (req, res) => {
  try {
    const { token, projectId } = req.body;

    if (!token || !projectId) {
      return res.status(400).json({
        success: false,
        msg: "Token and project ID are required"
      });
    }

    const decoded = jwt.verify(token, secret);

    const user = await userModel.findOne({
      _id: decoded.userId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    const project = await projectModel.findOne({
      _id: projectId,
      createdBy: user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        msg: "Project not found or access denied"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Project fetched successfully",
      project
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};
exports.deleteProject = async (req, res) => {
  try {

    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findOneAndDelete({ _id: projectId });

    return res.status(200).json({
      success: true,
      msg: "Project deleted successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};
exports.editProject = async (req, res) => {
  try {

    let { token, projectId, name } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.findOne({ _id: projectId });
    if (project) {
      project.name = name;
      await project.save();
      return res.status(200).json({
        success: true,
        msg: "Project edited successfully"
      })
    }
    else {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      })
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};