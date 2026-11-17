NAME		= virtualArch
SRC_DIR		= src
OBJ_DIR		= obj
C_FILES		= $(shell find "$(SRC_DIR)" -type f -name "*.c")
O_FILES		= $(C_FILES:$(SRC_DIR)/%.c=$(OBJ_DIR)/%.o)
C_FLAGS		= -Wall -Wextra -Werror -Iinclude

all: $(NAME)

$(NAME): $(O_FILES)
	$(CC) $(C_FLAGS) $^ -o $@

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c
	@mkdir -p $(shell dirname $(OBJ_DIR)/%.o)
	$(CC) $(C_FLAGS) -c $^ -o $@

clean:
	rm -rf $(OBJ_DIR)

fclean: clean
	rm -rf $(NAME)

re: fclean all

.PHONY: all clean fclean re