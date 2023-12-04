using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Interfaces;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using Microsoft.VisualBasic;

namespace API.Controllers
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }
    public class AccountController : BaseApiController
    {
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
            _tokenService = tokenService;
        }

        [Authorize] // Require authentication
        [HttpPost("change-password")] // PUT: api/account/change-password
        public async Task<ActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.GetUserAsync(User); // Get the currently logged-in user

            if (user == null)
            {
                return Ok(new { V = false});
            }

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);

            if (!result.Succeeded)
            {
                return Ok(new { V = false});
            }

            return Ok( new { V = true});
        }

        [Authorize (Roles = "Admin")] // Require authentication
        [HttpPost("register")] // POST: api/account/register?userName=abc&password=123
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            //check if userName already exists
            if (await UserExists(registerDto.UserName)) return BadRequest("UserName is taken");

            var user = _mapper.Map<AppUser>(registerDto);

            user.UserName = registerDto.UserName.ToLower();

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                Console.WriteLine(value: "**********************************************************************");
                Console.WriteLine(result.Errors.ToString());
                return BadRequest(result.ToString() + " error1");
            }

            var roleResult = await _userManager.AddToRoleAsync(user, "Employee");

            if (!roleResult.Succeeded) return BadRequest(result.Errors.ToString() + "error2");

            return new UserDto

            {
                UserName = user.UserName,
                Token = await _tokenService.CreateToken(user)
            };
        }

        [HttpPost("login")] // POST: api/account/login
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.Users
                    .SingleOrDefaultAsync(AppUser => AppUser.UserName == loginDto.UserName.ToLower());
                //get user from db

                //if null, return unauthorized
                if (user == null) return Unauthorized("Invalid userName");

                var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);

                if (!result) return Unauthorized();

                return new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Token = await _tokenService.CreateToken(user)
                };
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest(e.Message + " EROR " + e.InnerException?.Message + " " + e.InnerException?.InnerException?.Message + " " + e.ToString());
            }
        }

        private async Task<bool> UserExists(string userName)
        {
            return await _userManager.Users.AnyAsync(appUser => appUser.UserName == userName.ToLower());
        }
    }
}