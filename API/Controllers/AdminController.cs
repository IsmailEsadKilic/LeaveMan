using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{

    public class Pchange
    {
        public string NewPassword { get; set; }
    }
    public class AdminController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly DataContext _context;
        public AdminController(UserManager<AppUser> userManager, DataContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("change-password/{username}")]
        public async Task<ActionResult> ChangePassword(string username, Pchange pchange)
        {
            //only admin can change password
            //check if the user requesting the change is admin
            if (User.GetUserName() != "admin") return Unauthorized("Only admin can change password"); //if the user requesting the change is not admin, return unauthorized


            var newPassword = pchange.NewPassword;
            if (string.IsNullOrEmpty(username)) return BadRequest("No username was entered"); //if username is null or empty,
            if (string.IsNullOrEmpty(newPassword)) return BadRequest("No new password was entered"); //if new is null or empty, return bad request
            var user = await _userManager.FindByNameAsync(username); //find the user by username

            if (user == null) return NotFound("Could not find user"); //if user is null, return not found
            if (user.UserName == "admin") return BadRequest("Admin şifresi değiştirilemez");

            try
            {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            if (token == null) return BadRequest(new{ v = "Token is null"});

                try
                {

                // Reset the user's password
                var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

                if (result.Succeeded)
                {
                    return Ok(new { v = true });
                }
                else
                {
                    // Handle password reset failure, e.g., by returning error messages
                    return BadRequest(new { v = false});
                }     
                }
                catch (Exception ex)
                {
                    return BadRequest(new { v = "2__" + ex.Message });
                }
            }
                
            catch (System.Exception ex)
            {
                return BadRequest(new { v = "1__" + ex.Message });
            }

        }

        // //admin and mod
        // [Authorize(Roles = "Admin,Mod")]

        [Authorize(Roles = "Admin")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
            var users = await _userManager.Users
                .OrderBy(u => u.UserName)
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    Roles = u.UserRoles.Select(r => r.Role.Name).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-user/{username}")]
        public async Task<ActionResult> DeleteUser(string username)
        {
            var user = await _userManager.FindByNameAsync(username); //find the user by username

            if (user == null) return NotFound("Could not find user"); //if user is null, return not found

            //if this user has///////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //delete from AppUserRole table
            var userRoles = await _context.UserRoles.Where(u => u.UserId == user.Id).ToListAsync(); //get the user roles

            foreach (var userRole in userRoles) //loop through the user roles
            {
                _context.UserRoles.Remove(userRole); //remove the user role
            }
            var result = await _userManager.DeleteAsync(user); //delete the user

            if (!result.Succeeded) return BadRequest("Failed to delete user"); //if the result is not successful, return bad request

            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("edit-roles/{username}")] //username is the route parameter
        public async Task<ActionResult> EditRoles(string username, [FromQuery] string roles) //USAGE: api/admin/edit-roles/username?roles=Admin,Member
        {
            if (string.IsNullOrEmpty(roles)) return BadRequest("No roles were selected"); //if roles is null or empty, return bad request

            var selectedRoles = roles.Split(",").ToArray(); //split the roles string into an array

            var user = await _userManager.FindByNameAsync(username); //find the user by username

            if (user == null) return NotFound("Could not find user"); //if user is null, return not found

            var userRoles = await _userManager.GetRolesAsync(user); //get the roles for the user

            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles)); //add the roles to the user

            if (!result.Succeeded) return BadRequest("Failed to add to roles"); //if the result is not successful, return bad request

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles)); //remove the roles from the user

            if (!result.Succeeded) return BadRequest("Failed to remove the roles"); //if the result is not successful, return bad request

            return Ok(await _userManager.GetRolesAsync(user)); //return the roles for the user
        }


        [Authorize(Roles = "Admin")]
        [HttpPost("change-username/{from}")]
        public async Task<ActionResult> ChangeUsername( string from, [FromQuery] string newUserName)
        {
            if (string.IsNullOrEmpty(from)) return BadRequest("No username was entered"); //if from is null or empty,
            if (string.IsNullOrEmpty(newUserName)) return BadRequest("No new username was entered"); //if new is null or empty, return bad request
            newUserName = newUserName.ToLower(); //convert the new username to lowercase
            var user = await _userManager.FindByNameAsync(from); //find the user by username

            if (user == null) return NotFound("Could not find user"); //if user is null, return not found

            user.UserName = newUserName; //change the username

            var result = await _userManager.UpdateAsync(user); //update the user

            if (!result.Succeeded) return BadRequest("Failed to update user"); //if the result is not successful, return bad request

            return Ok(true);
        }
    }
}