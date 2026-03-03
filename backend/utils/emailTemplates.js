exports.verificationTokenTemplate = `
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="background-color:rgb(255,255,255);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif;">
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:37.5em;padding:20px;margin:auto;background-color:rgb(248,250,252)">
      <tbody>
        <tr style="width:100%">
          <td>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:rgb(255,255,255);border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <tbody>
                <tr>
                  <td>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:rgb(79,70,229);padding:24px;text-align:center;">
                      <tbody>
                        <tr>
                          <td>
                            <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">IntraHub</h1>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="padding:32px;">
                      <tbody>
                        <tr>
                          <td>
                            <h2 style="color:rgb(51,51,51);font-size:20px;font-weight:700;margin-bottom:16px;">Verify your email address</h2>
                            <p style="font-size:16px;line-height:24px;color:rgb(71,85,105);margin-bottom:24px;">
                              Welcome to IntraHub! We're excited to have you on board. Please click the button below to verify your email address and activate your account.
                            </p>
                            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="text-align:center;margin-bottom:24px;">
                              <tbody>
                                <tr>
                                  <td>
                                    <a href="{{VERIFICATION_LINK}}" style="display:inline-block;padding:12px 24px;background-color:rgb(79,70,229);color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
                                      Verify My Account
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p style="font-size:14px;color:rgb(100,116,139);margin:0;">
                              If the button doesn't work, copy and paste this link into your browser:
                              <br/>
                              <a href="{{VERIFICATION_LINK}}" style="color:rgb(79,70,229);">{{VERIFICATION_LINK}}</a>
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:12px;color:rgb(148,163,184);text-align:center;margin-top:24px;">
              © ${new Date().getFullYear()} IntraHub Internship Management System. All rights reserved.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

exports.interviewInviteTemplate = `
<html dir="ltr" lang="en">
  <body style="background-color:rgb(255,255,255);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:37.5em;padding:20px;margin:auto;">
      <tbody>
        <tr>
          <td>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:rgb(255,255,255);border:1px solid #e2e8f0;border-radius:8px;padding:32px;">
              <tbody>
                <tr>
                  <td>
                    <h2 style="color:rgb(15,23,42);margin-bottom:16px;">You've Received an Interview Invite!</h2>
                    <p style="font-size:16px;line-height:24px;color:rgb(71,85,105);">
                      Great news! <strong>{{COMPANY_NAME}}</strong> has reviewed your CV on IntraHub and would like to invite you for an interview.
                    </p>
                    <p style="font-size:16px;line-height:24px;color:rgb(71,85,105);margin-top:16px;">
                      Please log in to your dashboard to view more details and coordinate with the industry supervisor.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

exports.deadlineReminderTemplate = `
<html dir="ltr" lang="en">
  <body style="background-color:rgb(255,255,255);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:37.5em;padding:20px;margin:auto;">
      <tbody>
        <tr>
          <td>
            <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:rgb(255,255,255);border:1px solid #e2e8f0;border-left:4px solid rgb(239,68,68);border-radius:8px;padding:24px;">
              <tbody>
                <tr>
                  <td>
                    <h2 style="color:rgb(15,23,42);margin-bottom:16px;">Upcoming Deadline Reminder</h2>
                    <p style="font-size:16px;line-height:24px;color:rgb(71,85,105);">
                      This is an automated reminder that your task <strong>{{TASK_TITLE}}</strong> is due soon.
                    </p>
                    <div style="background-color:rgb(241,245,249);padding:16px;border-radius:6px;margin:24px 0;">
                      <p style="margin:0;font-size:16px;color:rgb(15,23,42);font-weight:600;">Deadline: {{DEADLINE}}</p>
                    </div>
                    <p style="font-size:14px;color:rgb(100,116,139);">
                      Please ensure you submit your deliverables via the IntraHub dashboard before the deadline.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
